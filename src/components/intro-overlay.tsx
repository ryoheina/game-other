import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const INTRO_DURATION_MS = 10_000;

export function IntroOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return <AnimatePresence>{visible && <motion.div className="fixed inset-0 z-[100] overflow-hidden bg-black" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 1.1, ease: "easeInOut" }}><video className="h-full w-full object-cover" src="/face.mp4" autoPlay muted playsInline preload="auto" onError={() => setVisible(false)} /><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(2,5,14,0.58)_100%)]" /><div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-xs font-semibold uppercase tracking-[0.45em] text-white/75">Enter the legend</div></motion.div>}</AnimatePresence>;
}
