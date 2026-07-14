import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const INTRO_DURATION_MS = 10_000;

export function IntroOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(false), INTRO_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, []);

  return <AnimatePresence>{visible && <motion.div className="fixed inset-0 z-[100] overflow-hidden bg-black" initial={{ opacity: 1 }} exit={{ opacity: 0, scale: 1.04 }} transition={{ duration: 1.15, ease: "easeInOut" }}><video className="h-full w-full object-cover" src="/face.mp4" autoPlay muted loop playsInline preload="auto" onError={() => setVisible(false)} /><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_38%,rgba(2,5,14,0.58)_100%)]" /><motion.div aria-hidden className="absolute left-1/2 top-1/2 h-[35vmax] w-[35vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(235,250,255,0.98)_0%,rgba(98,202,255,0.86)_12%,rgba(95,94,255,0.44)_32%,transparent_68%)] blur-sm" initial={{ opacity: 0, scale: 0.05 }} exit={{ opacity: [0, 1, 0], scale: [0.05, 0.72, 2.2] }} transition={{ duration: 1.15, times: [0, 0.18, 1], ease: "easeOut" }} /><motion.div aria-hidden className="absolute left-1/2 top-1/2 h-[18vmax] w-[18vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/80" initial={{ opacity: 0, scale: 0.1 }} exit={{ opacity: [0, 0.9, 0], scale: [0.1, 2.4, 4.4] }} transition={{ duration: 1.1, times: [0, 0.28, 1], ease: "easeOut" }} /><motion.div aria-hidden className="absolute left-1/2 top-1/2 h-[10vmax] w-[10vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet-200/75" initial={{ opacity: 0, scale: 0.1 }} exit={{ opacity: [0, 1, 0], scale: [0.1, 3, 6] }} transition={{ duration: 1.15, times: [0, 0.2, 1], ease: "easeOut" }} /><div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-xs font-semibold uppercase tracking-[0.45em] text-white/75">Enter the legend</div></motion.div>}</AnimatePresence>;
}
