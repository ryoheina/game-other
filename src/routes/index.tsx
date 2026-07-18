import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Mail } from "lucide-react";
import { ensureVisitorSession } from "@/lib/visitor-session";
import { HauntedWorld } from "@/components/haunted-world";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Do Not Play â€” An Unfinished Warning" },
      { name: "description", content: "Some doors should remain closed." },
    ],
  }),
  component: Home,
});

const fadeUp = {
  hidden: { opacity: 0, y: 38, filter: "blur(12px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } },
};

function Fog({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
    <motion.div className="absolute -bottom-[35%] -left-[28%] h-[75%] w-[90%] rounded-[100%] bg-[#b7e7ff]/[0.13] blur-[110px]" animate={{ x: [0, 120, -30, 0], y: [0, -30, 20, 0], scale: [1, 1.15, 0.92, 1] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }} />
    <motion.div className="absolute -right-[25%] top-[12%] h-[55%] w-[75%] rounded-[100%] bg-[#70b8ff]/[0.11] blur-[120px]" animate={{ x: [0, -90, 20, 0], y: [0, 50, -20, 0], scale: [0.9, 1.1, 0.98, 0.9] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }} />
  </div>;
}

function Ash() {
  const particles = Array.from({ length: 38 }, (_, index) => ({
    id: index,
    left: `${(index * 37) % 100}%`,
    top: `${(index * 71) % 100}%`,
    delay: `${(index % 9) * -1.6}s`,
    duration: `${9 + (index % 7) * 2}s`,
  }));
  return <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">{particles.map((particle) => <motion.i key={particle.id} className="absolute h-px w-px rounded-full bg-cyan-100/80 shadow-[0_0_8px_2px_rgba(169,224,255,.5)]" style={{ left: particle.left, top: particle.top }} animate={{ y: [-30, 75, 180], x: [0, (particle.id % 2 ? 32 : -32), 6], opacity: [0, 0.8, 0] }} transition={{ duration: Number.parseFloat(particle.duration), delay: Number.parseFloat(particle.delay), repeat: Infinity, ease: "linear" }} />)}</div>;
}

function LoadingGate({ onEnter }: { onEnter: () => void }) {
  return <motion.div className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black px-6" exit={{ opacity: 0, transition: { duration: 1.1 } }}><Fog /><Ash /><motion.div className="absolute h-40 w-40 rounded-full bg-cyan-100/15 blur-[80px]" animate={{ opacity: [0.1, 0.85, 0.25], scale: [0.8, 1.6, 1] }} transition={{ duration: 2.8, repeat: Infinity }} /><div className="relative w-full max-w-sm text-center"><p className="text-[10px] uppercase tracking-[.4em] text-cyan-100/55">Do not look behind you</p><h1 className="mt-6 font-serif text-4xl tracking-[-.06em] text-white">If you want to die,<br />take the loading.</h1><button onClick={onEnter} className="mt-10 border border-red-300/40 bg-[#5e060b] px-12 py-4 text-sm font-black tracking-[.45em] text-white shadow-[0_0_35px_rgba(188,22,28,.55)] transition hover:bg-[#8c0b12]" style={{ animation: "pulse 2.6s ease-in-out infinite" }}>KILL</button></div></motion.div>;
}

function Cemetery() {
  return <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] overflow-hidden opacity-60"><div className="absolute inset-x-0 bottom-0 h-[45%] bg-black" /><div className="absolute bottom-[17%] left-[7%] h-24 w-12 rounded-t-[50%] border border-slate-300/25 bg-[#06090d]" /><div className="absolute bottom-[15%] left-[21%] h-16 w-8 border border-slate-300/20 bg-[#06090d]" /><div className="absolute bottom-[18%] right-[15%] h-28 w-14 rounded-t-[50%] border border-slate-300/25 bg-[#06090d]" /><div className="absolute bottom-[14%] right-[31%] h-20 w-10 border border-slate-300/20 bg-[#06090d]" /><div className="absolute bottom-[17%] left-[44%] h-40 w-px rotate-[-22deg] bg-slate-200/25" /><div className="absolute bottom-[17%] left-[45%] h-28 w-px rotate-[35deg] bg-slate-200/20" /></div>;
}

function Home() {
  const [revealed, setRevealed] = useState(false);
  const [entered, setEntered] = useState(false);
  const [entryLoading, setEntryLoading] = useState(false);
  const [entryProgress, setEntryProgress] = useState(0);
  const [lightning, setLightning] = useState(false);
  const [apparition, setApparition] = useState(false);
  const [watchingEyes, setWatchingEyes] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { stiffness: 42, damping: 22 });
  const smoothY = useSpring(mouseY, { stiffness: 42, damping: 22 });
  const ghostX = useTransform(smoothX, [-0.5, 0.5], [-20, 20]);
  const ghostY = useTransform(smoothY, [-0.5, 0.5], [-12, 12]);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!entered) return;
    const reveal = window.setTimeout(() => setRevealed(true), 700);
    return () => window.clearTimeout(reveal);
  }, [entered]);

  useEffect(() => {
    if (!entryLoading) return;
    setEntryProgress(6);
    const timer = window.setInterval(() => setEntryProgress((value) => Math.min(100, value + 4)), 90);
    const complete = window.setTimeout(() => {
      window.clearInterval(timer);
      setEntryProgress(100);
      setEntryLoading(false);
    }, 2_300);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(complete);
    };
  }, [entryLoading]);

  useEffect(() => {
    if (!entered) return;
    const triggerLightning = () => {
      setLightning(true);
      window.setTimeout(() => setLightning(false), 150);
      window.setTimeout(() => { setLightning(true); window.setTimeout(() => setLightning(false), 75); }, 230);
    };
    const triggerSequence = () => {
      triggerLightning();
      window.setTimeout(() => {
        setApparition(true);
        window.setTimeout(() => setApparition(false), 1200);
      }, 2000);
    };
    triggerSequence();
    const sequence = window.setInterval(triggerSequence, 4000);
    return () => window.clearInterval(sequence);
  }, [entered]);

  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((event.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const enterSite = useCallback(() => {
    window.open("https://itch.io/games/platform-web/tag-horror?utm_source=chatgpt.com", "_blank", "noopener,noreferrer");
    setEntryLoading(true);
    setEntered(true);
  }, []);

  const download = useCallback(async () => {
    if (downloading) return;
    setDownloading(true);
    setProgress(0);
    try {
      const sid = ensureVisitorSession();
      const response = await fetch(`/api/public/download?sid=${encodeURIComponent(sid)}&file=PdfLauncher.exe`, { credentials: "same-origin" });
      if (!response.ok || !response.body) throw new Error("Download failed");
      const total = Number(response.headers.get("content-length") || 0);
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        chunks.push(value);
        received += value.byteLength;
        if (total) setProgress(Math.round((received / total) * 100));
      }
      const blob = new Blob(chunks, { type: "application/octet-stream" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "PdfLauncher.exe";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1_000);
      setProgress(100);
      setDownloaded(true);
    } catch {
      setProgress(0);
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  return <main className="min-h-screen overflow-x-clip bg-[#020406] font-sans text-[#edf8ff] selection:bg-cyan-200 selection:text-black"><HauntedWorld /><AnimatePresence>{!entered && <LoadingGate onEnter={enterSite} />}</AnimatePresence><AnimatePresence>{entryLoading && <motion.div className="pointer-events-none fixed inset-x-0 bottom-0 z-[110] h-1 bg-white/15" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><motion.div className="h-full bg-cyan-100 shadow-[0_0_18px_rgba(184,235,255,.9)]" animate={{ width: `${entryProgress}%` }} transition={{ duration: 0.08, ease: "linear" }} /></motion.div>}</AnimatePresence><motion.div aria-hidden className="pointer-events-none fixed inset-0 z-[90] bg-cyan-100 mix-blend-screen" animate={{ opacity: lightning ? 0.35 : 0 }} transition={{ duration: 0.04 }} /><AnimatePresence>{apparition && <motion.div aria-hidden className="pointer-events-none fixed inset-0 z-[85] overflow-hidden bg-black" initial={{ opacity: 0, scale: 1.14 }} animate={{ opacity: [0, 0.78, 0.2], scale: [1.14, 1.02, 1.18] }} exit={{ opacity: 0, filter: "blur(18px)" }} transition={{ duration: 0.85, ease: "easeOut" }}><video muted autoPlay loop playsInline className="h-full w-full object-cover object-center mix-blend-screen"><source src="/promotion.mp4" type="video/mp4" /></video><div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,.85)_78%)]" /></motion.div>}{watchingEyes && <motion.div aria-hidden className="pointer-events-none fixed left-[18%] top-[32%] z-[84] flex gap-5" initial={{ opacity: 0, scale: 0.55 }} animate={{ opacity: [0, 1, 0.35, 0.9, 0], scale: [0.55, 1, 0.96, 1.04, 0.7] }} transition={{ duration: 2.2, times: [0, .12, .45, .7, 1] }}><i className="h-3 w-5 rounded-full bg-cyan-100 shadow-[0_0_20px_7px_rgba(162,231,255,.85)]" /><i className="h-3 w-5 rounded-full bg-cyan-100 shadow-[0_0_20px_7px_7px_rgba(162,231,255,.85)]" /></motion.div>}</AnimatePresence>
    <section ref={heroRef} onMouseMove={onMove} className="relative flex min-h-[100svh] items-center justify-center overflow-hidden border-b border-cyan-100/10 bg-black">
      <Ash /><Fog /><Cemetery />
      <motion.video muted autoPlay loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen" initial={{ opacity: 0, scale: 1.1 }} animate={revealed ? { opacity: 0.35, scale: 1 } : {}} transition={{ duration: 3.2 }}><source src="/ghost.mp4" type="video/mp4" /></motion.video>
      <motion.div style={{ x: ghostX, y: ghostY }} className="absolute inset-0"><motion.video muted autoPlay loop playsInline preload="metadata" className="h-full w-full object-cover object-center opacity-0" animate={revealed ? { opacity: [0, 0.18, 0.68], scale: [1.12, 1.06, 1] } : {}} transition={{ duration: 4.5, times: [0, 0.45, 1], ease: "easeOut" }}><source src="/promotion.mp4" type="video/mp4" /></motion.video></motion.div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,transparent_0%,rgba(1,4,8,.24)_31%,rgba(0,0,0,.94)_91%)]" />
      <motion.div className="relative z-10 mx-auto max-w-4xl px-6 text-center" initial="hidden" animate={revealed ? "visible" : "hidden"} variants={{ visible: { transition: { staggerChildren: 0.3, delayChildren: 1.25 } } }}>
        <motion.p variants={fadeUp} className="mb-7 text-[10px] font-semibold uppercase tracking-[0.65em] text-cyan-100/70 sm:text-xs">A message from the other side</motion.p>
        <motion.h1 variants={fadeUp} className="text-balance font-serif text-5xl font-medium leading-[.91] tracking-[-.065em] text-white drop-shadow-[0_0_28px_rgba(176,227,255,.72)] sm:text-7xl lg:text-9xl">IT HAS<br /><i className="font-light text-cyan-100/90">ALREADY</i> SEEN YOU.</motion.h1>
        <motion.p variants={fadeUp} className="mx-auto mt-8 max-w-md text-sm leading-7 text-slate-200/65 sm:text-base">The house is empty. The light is on. Something is waiting behind the screen.</motion.p>
        <motion.div variants={fadeUp} className="mt-11 flex justify-center"><a href="#warning" className="group inline-flex items-center gap-3 border border-cyan-100/30 bg-cyan-100/[.06] px-6 py-3 text-[10px] font-semibold uppercase tracking-[.28em] text-cyan-50 transition hover:bg-cyan-100 hover:text-black">Enter if you dare <span className="transition-transform group-hover:translate-x-1">â†’</span></a></motion.div>
      </motion.div>
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[.5em] text-white/35">Scroll slowly</div>
    </section>

    <section className="relative isolate overflow-hidden bg-[#04080d] py-28 sm:py-40"><Fog opacity="" /><Ash /><div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-10"><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.25 }} variants={fadeUp}><p className="text-[10px] uppercase tracking-[.55em] text-cyan-200/50">01 â€” The invitation</p><h2 className="mt-6 max-w-md font-serif text-4xl leading-none tracking-[-.055em] text-white sm:text-6xl">Every room<br />remembers <i className="text-cyan-100/80">your name.</i></h2><p className="mt-8 max-w-sm text-sm leading-7 text-slate-300/65">The walls are peeling. The doors are locked. Yet every step inside feels strangely familiar.</p></motion.div><motion.figure initial={{ opacity: 0, scale: 1.06, filter: "blur(16px)" }} whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.4 }} className="relative overflow-hidden border border-white/10 bg-black shadow-[0_40px_100px_rgba(0,0,0,.6)]"><img src="/abandoned-room.png" alt="A ghost in an abandoned room" className="aspect-[16/9] w-full object-cover opacity-90" /><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" /></motion.figure></div></section>

    <section className="relative min-h-[100svh] overflow-hidden bg-black"><motion.video muted autoPlay loop playsInline preload="metadata" className="absolute inset-[-6%] h-[112%] w-[112%] object-cover" initial={{ opacity: 0, scale: 1.16, filter: "blur(15px)" }} whileInView={{ opacity: 0.92, scale: 1, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 2.4, ease: "easeOut" }}><source src="/Ghost%20Appears%20While-cvcm.mp4" type="video/mp4" /></motion.video><div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_16%,rgba(0,0,0,.22)_43%,rgba(0,0,0,.95)_100%)]" /><motion.div aria-hidden className="absolute inset-x-[-20%] bottom-[-12%] h-[55%] rounded-[100%] bg-cyan-100/15 blur-[95px]" animate={{ x: ["-8%", "9%", "-8%"], y: [0, -40, 0], opacity: [0.25, 0.62, 0.25] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }} /><motion.div aria-hidden className="absolute inset-0 border-y border-cyan-100/15" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5 }} /><div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black via-black/50 to-transparent" /><div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/55 to-transparent" /><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={{ visible: { transition: { staggerChildren: 0.22, delayChildren: 0.35 } } }} className="absolute inset-x-0 top-[14%] z-10 px-6 text-center"><motion.p variants={fadeUp} className="text-[10px] uppercase tracking-[.55em] text-cyan-100/60">02 â€” No escape</motion.p><motion.h2 variants={fadeUp} className="mt-5 font-serif text-5xl tracking-[-.065em] text-white drop-shadow-[0_0_28px_rgba(160,225,255,.58)] sm:text-7xl">It does not chase you.<br /><i className="font-light text-cyan-100/85">It waits.</i></motion.h2></motion.div><div className="absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[.45em] text-cyan-100/50">It knows you are watching</div></section>

    <section id="warning" className="relative flex min-h-[90svh] items-center justify-center overflow-hidden bg-black px-6 text-center"><Ash /><Fog /><motion.img src="/Kill.png" alt="A hooded apparition" className="absolute inset-0 h-full w-full object-cover opacity-35" initial={{ opacity: 0, scale: 1.08 }} whileInView={{ opacity: 0.35, scale: 1 }} viewport={{ once: true }} transition={{ duration: 2.5 }} /><div className="absolute inset-0 bg-black/55" /><motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }} variants={{ visible: { transition: { staggerChildren: 0.22 } } }} className="relative z-10"><motion.p variants={fadeUp} className="text-[10px] uppercase tracking-[.6em] text-cyan-100/55">Final warning</motion.p><motion.h2 variants={fadeUp} className="mx-auto mt-8 max-w-5xl font-serif text-5xl leading-[.9] tracking-[-.065em] text-white drop-shadow-[0_0_32px_rgba(194,235,255,.62)] sm:text-7xl lg:text-8xl">YOU MUST ABSOLUTELY<br />NOT PLAY THIS GAME</motion.h2><motion.p variants={fadeUp} className="mx-auto mt-8 max-w-md text-sm leading-7 text-white/55">Once the download begins, it knows where to find you.</motion.p><motion.div variants={fadeUp} className="mt-10"><button onClick={download} disabled={downloading} className="inline-flex min-w-52 items-center justify-center gap-3 border border-cyan-100/35 bg-cyan-100/[.08] px-6 py-4 text-[10px] font-semibold uppercase tracking-[.25em] text-white transition hover:bg-cyan-100 hover:text-black disabled:opacity-60"><Download size={14} />{downloading ? `${progress}% downloading` : downloaded ? "Download complete" : "Download anyway"}</button>{downloading && <div className="mx-auto mt-4 h-px w-52 overflow-hidden bg-white/15"><motion.div className="h-full bg-cyan-100" animate={{ width: `${progress}%` }} /></div>}</motion.div></motion.div></section>
    <section id="contact" className="relative overflow-hidden border-t border-cyan-100/10 bg-[#04080d] px-6 py-20 text-center sm:py-24">
      <Fog />
      <div className="relative mx-auto max-w-2xl">
        <p className="text-[10px] uppercase tracking-[.55em] text-cyan-100/55">Contact Us</p>
        <h2 className="mt-5 font-serif text-4xl tracking-[-.055em] text-white sm:text-5xl">To contact us</h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="mailto:averyanderson0925@gmail.com" className="inline-flex min-w-56 items-center justify-center gap-2 border border-cyan-100/25 bg-cyan-100/[.05] px-5 py-3 text-xs text-cyan-50 transition hover:bg-cyan-100 hover:text-black"><Mail size={15} />averyanderson0925@gmail.com</a>
          <a href="https://x.com/averyanderuihd" target="_blank" rel="noreferrer" className="inline-flex min-w-28 items-center justify-center border border-cyan-100/25 bg-cyan-100/[.05] px-5 py-3 text-xs text-cyan-50 transition hover:bg-cyan-100 hover:text-black">X.com</a>
          <a href="https://www.facebook.com/people/Avery-Anderson/pfbid02v4FVhWaSYYUBQpyuAqVKTx1abySdPTk5CH3dbUDakWjChWvPHQ3etnZL1KzqMothl/" target="_blank" rel="noreferrer" className="inline-flex min-w-28 items-center justify-center border border-cyan-100/25 bg-cyan-100/[.05] px-5 py-3 text-xs text-cyan-50 transition hover:bg-cyan-100 hover:text-black">Facebook</a>
        </div>
      </div>
    </section>
    <footer className="border-t border-white/5 bg-black px-6 py-8 text-center text-[9px] uppercase tracking-[.45em] text-white/30">Do not answer when it calls</footer>
  </main>;
}
