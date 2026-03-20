import { useEffect, useRef } from "react";
import * as THREE from "three";
import styles from "./BallFieldWebGL.module.css";

type Ball = {
  active: boolean;
  r: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  isGold: boolean;
  meshIndex: number;
  // Organic motion & entrance
  phase: number;
  orbitRadius: number;
  orbitSpeed: number;
  birthDelay: number;
  currentScale: number;
  rotAxis: THREE.Vector3;
  rotSpeed: number;
  rotAngle: number;
};

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const clamp01 = (n: number) => clamp(n, 0, 1);
const rand = (min: number, max: number) => Math.random() * (max - min) + min;
const easeOutQuart = (t: number) => 1 - Math.pow(1 - clamp01(t), 4);
const smoothStep = (t: number) => t * t * (3 - 2 * t);

export default function BallFieldWebGL({ scatterAmount }: { scatterAmount: number }) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  const scatterAmountRef = useRef(0);
  scatterAmountRef.current = clamp01(scatterAmount);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);
    camera.position.set(0, 0, 16);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    // @ts-ignore
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearAlpha(0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    // Lighting — improved for depth
    const hemiLight = new THREE.HemisphereLight(0xd8d0ff, 0x0f1020, 1.2);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(7, 9, 12);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xc8b8ff, 0.45);
    fillLight.position.set(-7, -2, 6);
    scene.add(fillLight);

    // Rim light from behind for 3D edge definition
    const rimLight = new THREE.DirectionalLight(0x8866cc, 0.35);
    rimLight.position.set(0, 3, -8);
    scene.add(rimLight);

    // Geometry + Materials — higher poly, slightly more reflective
    const geometry = new THREE.SphereGeometry(1, 32, 24);

    const purpleMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#4B2E83"),
      roughness: 0.28,
      metalness: 0.12,
    });

    const goldMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FDB913"),
      roughness: 0.28,
      metalness: 0.12,
    });

    // Instances
    const COUNT = 46;
    const goldCount = Math.floor(COUNT / 3);
    const purpleCount = COUNT - goldCount;

    const purpleMesh = new THREE.InstancedMesh(geometry, purpleMat, purpleCount);
    const goldMesh = new THREE.InstancedMesh(geometry, goldMat, goldCount);

    purpleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    goldMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    scene.add(purpleMesh);
    scene.add(goldMesh);

    // Physics tuning — smoother feel
    const CENTER = new THREE.Vector3(0, 0, 0);

    const CLUSTER_RADIUS = 5.2;
    const GRAVITY = 0.18;
    const DRAG_CLUSTER = 0.98;

    const RESTITUTION = 0.65;
    const COLLISION_PASSES = 2;

    const OUTWARD_FORCE = 6.5;
    const DRAG_SCATTER = 0.997;
    const MAX_SPEED_CLUSTER = 1.4;
    const MAX_SPEED_SCATTER = 12.0;

    const OFFSCREEN_KILL_RADIUS = 20;

    // Ball sizes
    const R_MIN = 0.48;
    const R_MAX = 0.95;

    // Entrance timing
    const ENTRANCE_DURATION = 1.0;
    const ENTRANCE_STAGGER = 1.2;

    // Organic motion
    const PULSE_AMPLITUDE = 0.035;
    const PULSE_SPEED = 0.8;

    // Mouse "hand" cylinder
    const HAND_RADIUS = 1.9;
    const HAND_STRENGTH = 5.5;
    const HAND_DAMPING = 0.90;
    const HAND_MAX_VEL = 3.0; // cap velocity after hand push

    // Mouse mapping to z=0 plane
    const pointerNDC = new THREE.Vector2(0, 0);
    const handPos = new THREE.Vector3(999, 999, 0);
    const handActive = { value: false };

    const raycaster = new THREE.Raycaster();
    const planeZ0 = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    const lastHandPos = new THREE.Vector3(999, 999, 0);

    const updateHandFromClientXY = (clientX: number, clientY: number) => {
      const rect = host.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) return;

      const inside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (!inside) {
        handActive.value = false;
        handPos.set(999, 999, 0);
        return;
      }

      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((clientY - rect.top) / rect.height) * 2 - 1);

      pointerNDC.set(x, y);
      raycaster.setFromCamera(pointerNDC, camera);
      raycaster.ray.intersectPlane(planeZ0, handPos);
      handActive.value = true;
    };

    const onPointerMove = (ev: PointerEvent) => updateHandFromClientXY(ev.clientX, ev.clientY);

    const onScroll = () => {
      handActive.value = false;
      handPos.set(999, 999, 0);
      lastHandPos.set(999, 999, 0);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    // Balls
    let pIdx = 0;
    let gIdx = 0;

    const balls: Ball[] = Array.from({ length: COUNT }).map((_, i) => {
      const isGold = i % 3 === 2;
      const meshIndex = isGold ? gIdx++ : pIdx++;

      const r = rand(R_MIN, R_MAX);

      // Start closer to center for a bloom-out entrance
      const dir = new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1));
      if (dir.lengthSq() < 1e-6) dir.set(1, 0, 0);
      dir.normalize();

      const dist = rand(0, CLUSTER_RADIUS * 0.3);
      const pos = dir.multiplyScalar(dist);

      const vel = new THREE.Vector3(rand(-0.05, 0.05), rand(-0.05, 0.05), rand(-0.05, 0.05));

      // Stagger entrance: randomised with slight distance bias
      const normalizedDist = dist / (CLUSTER_RADIUS * 0.3 || 1);
      const birthDelay = normalizedDist * ENTRANCE_STAGGER * 0.4 + rand(0, ENTRANCE_STAGGER * 0.6);

      // Unique organic motion parameters
      const phase = rand(0, Math.PI * 2);
      const orbitRadius = rand(0.15, 0.4);
      const orbitSpeed = rand(0.3, 0.65);

      // Per-ball rotation
      const rotAxis = new THREE.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();
      const rotSpeed = rand(0.2, 0.7) * (Math.random() > 0.5 ? 1 : -1);

      return {
        active: true,
        r,
        pos,
        vel,
        isGold,
        meshIndex,
        phase,
        orbitRadius,
        orbitSpeed,
        birthDelay,
        currentScale: 0,
        rotAxis,
        rotSpeed,
        rotAngle: rand(0, Math.PI * 2),
      };
    });

    const dummy = new THREE.Object3D();
    const quat = new THREE.Quaternion();

    const applyInstance = (b: Ball) => {
      if (!b.active || b.currentScale < 0.001) {
        dummy.position.set(0, 0, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        if (b.isGold) goldMesh.setMatrixAt(b.meshIndex, dummy.matrix);
        else purpleMesh.setMatrixAt(b.meshIndex, dummy.matrix);
        return;
      }

      dummy.position.copy(b.pos);
      dummy.scale.setScalar(b.currentScale);
      quat.setFromAxisAngle(b.rotAxis, b.rotAngle);
      dummy.quaternion.copy(quat);
      dummy.updateMatrix();

      if (b.isGold) goldMesh.setMatrixAt(b.meshIndex, dummy.matrix);
      else purpleMesh.setMatrixAt(b.meshIndex, dummy.matrix);
    };

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, true);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // Helpers
    const tmp = new THREE.Vector3();
    const n = new THREE.Vector3();

    const capSpeed = (v: THREE.Vector3, max: number) => {
      const sp = v.length();
      if (sp > max) v.multiplyScalar(max / (sp || 1));
    };

    const resolveCollision = (a: Ball, b: Ball) => {
      n.copy(b.pos).sub(a.pos);
      const dist = n.length();
      const minDist = a.r + b.r;

      if (dist <= 0 || dist >= minDist) return;

      n.multiplyScalar(1 / dist);

      const overlap = minDist - dist;

      const massA = a.r * a.r * a.r;
      const massB = b.r * b.r * b.r;

      const invA = 1 / massA;
      const invB = 1 / massB;
      const invSum = invA + invB;

      a.pos.addScaledVector(n, -overlap * (invA / invSum));
      b.pos.addScaledVector(n, overlap * (invB / invSum));

      tmp.copy(b.vel).sub(a.vel);
      const velAlongNormal = tmp.dot(n);
      if (velAlongNormal > 0) return;

      const j = (-(1 + RESTITUTION) * velAlongNormal) / invSum;

      tmp.copy(n).multiplyScalar(j);
      a.vel.addScaledVector(tmp, -invA);
      b.vel.addScaledVector(tmp, invB);
    };

    // Cursor cylinder force in XY — soft, smoothed interaction
    let smoothHandSpeed = 0;

    const applyHandForces = (dtSec: number) => {
      if (!handActive.value) {
        smoothHandSpeed = 0;
        smoothHandSpeed = 0;
        lastHandPos.set(999, 999, 0);
        return;
      }

      const dxh = handPos.x - lastHandPos.x;
      const dyh = handPos.y - lastHandPos.y;
      const dist = Math.hypot(dxh, dyh);
      const rawSpeed = dtSec > 0 ? dist / dtSec : 0;
      lastHandPos.copy(handPos);

      // Exponential moving average — smooths out spiky cursor jumps
      const smoothing = 0.15;
      smoothHandSpeed += (rawSpeed - smoothHandSpeed) * smoothing;

      const DEADZONE = 2.0;
      const MAX_SPEED = 20.0;
      const u = clamp01((smoothHandSpeed - DEADZONE) / (MAX_SPEED - DEADZONE));

      // Quadratic ramp — responsive to medium-speed movement
      const ramp = u * u;
      const speedBoost = 1 + ramp * 1.6; // up to 2.6x at max
      const dynamicRadius = HAND_RADIUS * (1 + ramp * 0.35);

      for (const b of balls) {
        if (!b.active) continue;

        const dx = b.pos.x - handPos.x;
        const dy = b.pos.y - handPos.y;

        const d = Math.hypot(dx, dy);
        const reach = dynamicRadius + b.r;
        if (d >= reach) continue;

        const inv = 1 / (d || 1);
        const nx = dx * inv;
        const ny = dy * inv;

        // Quadratic falloff — smooth but present
        const t = clamp01(1 - d / reach);
        const strength = HAND_STRENGTH * speedBoost * t * t;

        b.vel.x += nx * strength * dtSec;
        b.vel.y += ny * strength * dtSec;

        // Gentle damping — floaty drift instead of harsh stop
        b.vel.multiplyScalar(Math.pow(HAND_DAMPING, dtSec * 60));

        // Cap velocity so balls never get launched violently
        const sp = Math.hypot(b.vel.x, b.vel.y, b.vel.z);
        if (sp > HAND_MAX_VEL) {
          const scale = HAND_MAX_VEL / sp;
          b.vel.x *= scale;
          b.vel.y *= scale;
          b.vel.z *= scale;
        }
      }
    };

    // Init
    for (const b of balls) applyInstance(b);
    purpleMesh.instanceMatrix.needsUpdate = true;
    goldMesh.instanceMatrix.needsUpdate = true;

    const clock = new THREE.Clock();
    let raf: number | null = null;
    let elapsed = 0;

    // Prevent outward burst while scrolling back up
    let prevS = 0;
    let returnModeFrames = 0;
    const RETURN_DURATION = 40;

    const step = () => {
      const dtSec = clamp(clock.getDelta(), 0.008, 0.03);
      const dt = dtSec * 60;
      elapsed += dtSec;

      const s = clamp01(scatterAmountRef.current);
      const ds = s - prevS;
      prevS = s;

      // if scatter decreases, we are going back up, reform instead of pushing outward
      if (ds < -0.0005) returnModeFrames = RETURN_DURATION;
      if (returnModeFrames > 0) returnModeFrames--;

      const shouldCluster = s < 0.02 || returnModeFrames > 0;

      if (shouldCluster) {
        applyHandForces(dtSec);

        for (const b of balls) {
          // --- Entrance animation ---
          const entranceT = clamp01((elapsed - b.birthDelay) / ENTRANCE_DURATION);
          const entranceScale = easeOutQuart(entranceT);

          // Subtle pulsing once fully entered
          const pulseT = elapsed * PULSE_SPEED * Math.PI * 2 + b.phase;
          const pulse = entranceT >= 1 ? Math.sin(pulseT) * PULSE_AMPLITUDE : 0;
          b.currentScale = b.r * entranceScale + pulse;

          // --- Organic drift: sine-wave offset from center ---
          const driftX = Math.sin(elapsed * b.orbitSpeed + b.phase) * b.orbitRadius;
          const driftY = Math.cos(elapsed * b.orbitSpeed * 0.7 + b.phase + 1.3) * b.orbitRadius;
          const driftZ = Math.sin(elapsed * b.orbitSpeed * 0.5 + b.phase + 2.7) * b.orbitRadius * 0.5;

          // --- Return mode easing ---
          const returnEase = returnModeFrames > 0
            ? smoothStep(returnModeFrames / RETURN_DURATION)
            : 0;

          const pull = returnModeFrames > 0 ? GRAVITY * (1 + returnEase * 1.2) : GRAVITY;
          const drag = returnModeFrames > 0 ? 0.98 - returnEase * 0.02 : DRAG_CLUSTER;

          // Pull toward drifting target instead of dead center
          tmp.set(CENTER.x + driftX, CENTER.y + driftY, CENTER.z + driftZ).sub(b.pos);
          b.vel.addScaledVector(tmp, pull * dtSec);

          b.vel.multiplyScalar(Math.pow(drag, dt));
          capSpeed(b.vel, MAX_SPEED_CLUSTER);

          b.pos.addScaledVector(b.vel, dt);

          // Soft boundary — gradual pushback instead of hard clamp
          const d = b.pos.length();
          if (d > CLUSTER_RADIUS) {
            const overshoot = clamp01((d - CLUSTER_RADIUS) / 1.0);
            b.pos.multiplyScalar(1 - overshoot * (1 - CLUSTER_RADIUS / d));
            b.vel.multiplyScalar(1 - overshoot * 0.25);
          }

          // Rotation
          b.rotAngle += b.rotSpeed * dtSec;

          b.active = true;
        }

        for (let pass = 0; pass < COLLISION_PASSES; pass++) {
          for (let i = 0; i < balls.length; i++) {
            for (let j = i + 1; j < balls.length; j++) {
              resolveCollision(balls[i], balls[j]);
            }
          }
        }
      } else {
        // scatter outward
        for (const b of balls) {
          if (!b.active) continue;

          tmp.copy(b.pos);
          const len = tmp.length();
          if (len > 1e-6) tmp.multiplyScalar(1 / len);
          else tmp.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize();

          b.vel.addScaledVector(tmp, OUTWARD_FORCE * s * dtSec);
          b.vel.multiplyScalar(Math.pow(DRAG_SCATTER, dt));
          capSpeed(b.vel, MAX_SPEED_SCATTER);

          b.pos.addScaledVector(b.vel, dt);

          // Keep full scale during scatter
          b.currentScale = b.r;

          if (b.pos.length() > OFFSCREEN_KILL_RADIUS) b.active = false;
        }
      }

      for (const b of balls) applyInstance(b);
      purpleMesh.instanceMatrix.needsUpdate = true;
      goldMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);

      if (raf) cancelAnimationFrame(raf);

      scene.remove(purpleMesh);
      scene.remove(goldMesh);

      geometry.dispose();
      purpleMat.dispose();
      goldMat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} className={styles.webglLayer} aria-hidden="true" />;
}
