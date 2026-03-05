import { useState } from "react";
import JoinRing from "../JoinRing/JoinRing";
import styles from "./Footer.module.css";

export default function Footer() {
  const [showJoinModal, setShowJoinModal] = useState(false);

  return (
    <>
      <footer className={styles.footer}>
        <span>© {new Date().getFullYear()} CS Webring</span>
        <button 
          onClick={() => setShowJoinModal(true)}
          className={styles.joinButton}
        >
          Join the ring
        </button>
      </footer>

      {showJoinModal && <JoinRing onClose={() => setShowJoinModal(false)} />}
    </>
  );
}
