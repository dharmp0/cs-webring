import { useEffect } from "react";
import Scene from "./components/Scene/Scene";
import Footer from "./components/Footer/Footer";

export default function App() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <Scene />
      <Footer />
    </>
  );
}
