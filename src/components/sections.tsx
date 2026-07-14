import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Check, Download as DownloadIcon, Flame, Play, Swords, TowerControl } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Fog, Particles } from "./fx";

type DownloadHandler = () => void;

const reveal = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};
const HERO_VIDEOS = ["/hero1.mp4", "/hero2.mp4", "/hero3.mp4", "/hero4.mp4"];

function useNearViewport(rootMargin = "300px") {
  const ref = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setNear(true);
      observer.disconnect();
    }, { rootMargin });
    observer.observe(node);
    return () => observer.disconnect();
  }, [near, rootMargin]);

  return { ref, near };
}

function LazyVideo({
  src,
  className = "",
  poster,
  autoPlay = true,
  controls = false,
}: {
  src: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
}) {
  const { ref, near } = useNearViewport();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !near || !autoPlay || reducedMotion) return;
    const observer = new IntersectionObserver(([entry]) => {
      const isVisible = Boolean(entry?.isIntersecting);
      setVisible(isVisible);
      if (isVisible) video.play().catch(() => undefined);
      else video.pause();
    }, { threshold: 0.05 });
    observer.observe(video);
    return () => observer.disconnect();
  }, [autoPlay, near, reducedMotion]);

  return (
    <div ref={ref} className={className}>
      {near && (
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={src}
          poster={poster}
          autoPlay={autoPlay && !reducedMotion}
          muted={autoPlay}
          defaultMuted={autoPlay}
          loop={autoPlay}
          playsInline
          controls={controls}
          preload="metadata"
          aria-hidden={autoPlay}
          data-playing={visible}
        />
      )}
    </div>
  );
}

function SectionIntro({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <motion.div variants={reveal} className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.38em] text-[#e8c86a]">{eyebrow}</p>
      <h2 className="display mt-4 text-4xl leading-tight text-white sm:text-5xl md:text-6xl">{title}</h2>
      {children && <p className="mt-5 text-base leading-relaxed text-white/65 sm:text-lg">{children}</p>}
    </motion.div>
  );
}

export function DownloadButton({ onDownload, className = "", label = "Download Free" }: { onDownload: DownloadHandler; className?: string; label?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.button
      type="button"
      onClick={onDownload}
      onPointerMove={(event) => {
        const element = event.currentTarget;
        const bounds = element.getBoundingClientRect();
        element.style.setProperty("--magnet-x", `${(event.clientX - bounds.left - bounds.width / 2) * 0.08}px`);
        element.style.setProperty("--magnet-y", `${(event.clientY - bounds.top - bounds.height / 2) * 0.08}px`);
      }}
      onPointerLeave={(event) => {
        event.currentTarget.style.setProperty("--magnet-x", "0px");
        event.currentTarget.style.setProperty("--magnet-y", "0px");
      }}
      whileHover={{ scale: 1.035, x: "var(--magnet-x)", y: "var(--magnet-y)" }}
      whileTap={{ scale: 0.97 }}
      className={`group relative isolate inline-flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#f7de8b] via-[#d9ae45] to-[#9e6b18] px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#160f05] shadow-[0_0_0_1px_rgba(255,237,170,0.8),0_18px_55px_rgba(218,170,53,0.35)] transition-shadow hover:shadow-[0_0_0_1px_rgba(255,244,190,1),0_22px_70px_rgba(230,185,65,0.55)] ${className}`}
    >
      {!reducedMotion && <motion.span aria-hidden className="absolute inset-0 -z-10 rounded-full border border-[#fff1ad]" animate={{ scale: [1, 1.18, 1.18], opacity: [0.7, 0, 0] }} transition={{ duration: 1.25, repeat: Infinity, repeatDelay: 4.75 }} />}
      <span aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.72),transparent_48%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <DownloadIcon className="h-4 w-4" />
      <span>{label}</span><ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
    </motion.button>
  );
}

function HeroVideoCarousel() {
  const reducedMotion = useReducedMotion();
  const [activeVideo, setActiveVideo] = useState(0);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = window.setInterval(() => setActiveVideo((current) => (current + 1) % HERO_VIDEOS.length), 4500);
    return () => window.clearInterval(interval);
  }, [reducedMotion]);

  useEffect(() => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === activeVideo && !reducedMotion) video.play().catch(() => undefined);
      else video.pause();
    });
  }, [activeVideo, reducedMotion]);

  return <>{HERO_VIDEOS.map((src, index) => <motion.video ref={(node) => { videoRefs.current[index] = node; }} key={src} className="absolute inset-0 h-full w-full object-cover" src={src} autoPlay={index === 0 && !reducedMotion} muted loop playsInline preload="metadata" initial={false} animate={{ opacity: activeVideo === index ? 1 : 0, scale: activeVideo === index ? 1.08 : 1.02 }} transition={{ opacity: { duration: reducedMotion ? 0 : 1.1, ease: "easeInOut" }, scale: { duration: 4.5, ease: "linear" } }} />)}</>;
}

export function Hero({ onDownload }: { onDownload: DownloadHandler }) {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : 120]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, reducedMotion ? 1 : 1.08]);

  return (
    <section id="hero" ref={ref} className="relative isolate flex min-h-[720px] min-h-[100svh] items-center overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0 -z-10 origin-top">
        <HeroVideoCarousel />
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,4,6,0.91)_0%,rgba(4,4,6,0.58)_45%,rgba(4,4,6,0.24)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_28%,rgba(230,188,81,0.16),transparent_28%),linear-gradient(0deg,rgba(4,4,6,0.9),transparent_42%)]" />
      <div aria-hidden className="absolute inset-0 -z-0 bg-[linear-gradient(112deg,transparent_25%,rgba(255,225,140,0.1)_48%,transparent_62%)] opacity-60" />
      <Fog className="-z-0" opacity={0.12} />
      <Particles count={18} color="gold" className="-z-0 opacity-70" />
      <div className="relative mx-auto w-full max-w-7xl px-6 pt-24 sm:px-8">
        <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.13 } } }} className="max-w-3xl">
          <motion.p variants={reveal} className="text-xs font-bold uppercase tracking-[0.4em] text-[#edd47d]">The next great fantasy RPG</motion.p>
          <motion.h1 variants={reveal} className="display mt-5 text-5xl leading-[0.92] text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] sm:text-7xl md:text-8xl lg:text-9xl">
            Legends of<br /><span className="text-gradient-gold">Eternity</span>
          </motion.h1>
          <motion.p variants={reveal} className="mt-7 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl">
            Battle gigantic bosses, master forbidden magic, and explore a handcrafted dark fantasy kingdom.
          </motion.p>
          <motion.div variants={reveal} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <DownloadButton onDownload={onDownload} />
            <a href="#trailer" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/25 bg-black/25 px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:border-[#e8c86a]/70 hover:bg-white/10">
              <Play className="h-4 w-4 fill-current" /> Watch trailer
            </a>
          </motion.div>
          <motion.div variants={reveal} className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/60">
            <span>Free to download</span><span>Windows PC</span><span>No account required</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function GameplayFeatures() {
  return <section id="features" className="overflow-hidden">
    <motion.article initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} className="relative isolate flex min-h-[620px] items-end overflow-hidden py-20 sm:min-h-[760px] sm:py-28"><div className="absolute inset-0 -z-20"><LazyVideo src="/play4.mp4" className="h-full w-full" /></div><div className="absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(4,4,6,0.94),rgba(4,4,6,0.18)_72%),linear-gradient(90deg,rgba(4,4,6,0.7),transparent_65%)]" /><motion.div variants={reveal} className="mx-auto w-full max-w-7xl px-6 sm:px-8"><p className="text-xs font-bold uppercase tracking-[0.4em] text-[#e8c86a]">I. Discover the world</p><h2 className="display mt-5 max-w-2xl text-4xl leading-tight text-white sm:text-6xl">A kingdom that hides more than it reveals.</h2></motion.div></motion.article>
    <motion.article initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={{ visible: { transition: { staggerChildren: 0.14 } } }} className="mx-auto grid max-w-7xl items-center gap-9 px-6 py-24 sm:px-8 sm:py-32 md:grid-cols-[1.1fr_.9fr] md:gap-16"><motion.div variants={reveal} className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/40 transition duration-500 hover:border-[#e8c86a]/55 hover:shadow-[0_18px_60px_rgba(208,160,54,0.18)]"><LazyVideo src="/play1.mp4" className="h-full w-full transition duration-700 group-hover:scale-105" /><div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_42%,rgba(255,228,144,0.16)_50%,transparent_58%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" /></motion.div><motion.div variants={reveal}><p className="text-xs font-bold uppercase tracking-[0.4em] text-[#e8c86a]">II. Experience combat</p><h2 className="display mt-5 text-4xl leading-tight text-white sm:text-5xl">Every strike is a decision.</h2><p className="mt-5 max-w-md text-lg leading-relaxed text-white/65">Dodge, commit, and make the opening count.</p></motion.div></motion.article>
    <motion.article initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-10%" }} variants={{ visible: { transition: { staggerChildren: 0.14 } } }} className="relative overflow-hidden bg-[#09080a] py-24 sm:py-32"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_50%,rgba(107,72,179,0.3),transparent_30%),radial-gradient(circle_at_75%_50%,rgba(218,174,62,0.13),transparent_28%)]" /><div className="mx-auto grid max-w-7xl items-center gap-10 px-6 sm:px-8 md:grid-cols-2 md:gap-16"><motion.div variants={reveal} className="md:pl-12"><p className="text-xs font-bold uppercase tracking-[0.4em] text-[#e8c86a]">III. Master the forbidden</p><h2 className="display mt-5 text-4xl leading-tight text-white sm:text-5xl">Power changes the shape of the fight.</h2><p className="mt-5 max-w-md text-lg leading-relaxed text-white/65">Call on magic that turns danger into opportunity.</p></motion.div><motion.div variants={reveal} className="group relative aspect-[4/5] max-h-[600px] overflow-hidden rounded-[2rem] border border-[#e8c86a]/20 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]"><LazyVideo src="/play3.mp4" className="h-full w-full transition duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" /></motion.div></div></motion.article>
  </section>;
}

export function BossShowcase() {
  return <section className="relative isolate min-h-[580px] overflow-hidden py-24 sm:min-h-[700px] sm:py-32"><div className="absolute inset-0 -z-20"><LazyVideo src="/play2.mp4" className="h-full w-full" /></div><div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,4,6,0.92),rgba(4,4,6,0.48),rgba(4,4,6,0.7)),linear-gradient(0deg,rgba(4,4,6,0.88),transparent_55%)]" /><Particles count={16} color="ember" className="-z-0" /><motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="mx-auto flex min-h-[390px] max-w-7xl flex-col justify-end px-6 sm:px-8"><motion.p variants={reveal} className="text-xs font-bold uppercase tracking-[0.4em] text-[#e9c96b]">The hunt begins</motion.p><motion.h2 variants={reveal} className="display mt-5 max-w-3xl text-4xl leading-tight text-white sm:text-6xl">Face Enemies That Demand Mastery</motion.h2><motion.p variants={reveal} className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">Every boss tests your timing, resolve, and command of forbidden power.</motion.p></motion.div></section>;
}

const reasons = [
  [Swords, "Dynamic Combat", "A fast, satisfying combat system with room for mastery."],
  [TowerControl, "A Fantasy World Worth Exploring", "Lost cities, hidden paths, and grand landscapes around every turn."],
  [Flame, "Bosses That Demand Courage", "Face unforgettable enemies that turn every victory into a legend."],
];

export function WhyPlay() {
  return (
    <section className="relative overflow-hidden border-y border-white/[0.08] bg-black/20 py-24 sm:py-28">
      <motion.div aria-hidden className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_30%,rgba(220,175,66,0.13),transparent_28%),radial-gradient(circle_at_80%_65%,rgba(89,126,210,0.12),transparent_32%)]" animate={{ backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"] }} transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.13 } } }} className="mx-auto max-w-7xl px-6 sm:px-8">
        <SectionIntro eyebrow="Your legend starts here" title="Why you’ll want to play" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reasons.map(([Icon, title, description]) => {
            const ReasonIcon = Icon as typeof Swords;
            return <motion.div key={title as string} variants={reveal} whileHover={{ y: -5, rotateX: 2, rotateY: -2 }} className="group rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-transparent p-8 text-center shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition hover:border-[#e8c86a]/40">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-[#e8c86a]/45 bg-[#d8ae45]/10 text-[#ecd174] shadow-[0_0_30px_rgba(218,175,68,0.15)] transition duration-500 group-hover:shadow-[0_0_40px_rgba(218,175,68,0.4)]"><ReasonIcon className="h-6 w-6" /></div>
              <h3 className="display mt-6 text-2xl text-white">{title as string}</h3><p className="mt-3 leading-relaxed text-white/60">{description as string}</p>
            </motion.div>;
          })}
        </div>
      </motion.div>
    </section>
  );
}

export function GameplayGallery() {
  return (
    <section id="gallery" className="py-24 sm:py-32">
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={{ visible: { transition: { staggerChildren: 0.08 } } }} className="mx-auto max-w-7xl px-6 sm:px-8">
        <SectionIntro eyebrow="See the world in motion" title="A kingdom on the brink" />
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[5, 6, 7, 8, 9, 10].map((number) => (
            <motion.div variants={reveal} key={number} className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black transition duration-500 hover:border-[#e8c86a]/60 hover:shadow-[0_0_35px_rgba(218,175,68,0.24)]">
              <LazyVideo src={`/play${number}.mp4`} className="h-full w-full transition duration-700 group-hover:scale-110" />
              <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/0 transition duration-500 group-hover:bg-black/25"><span className="grid h-12 w-12 scale-75 place-items-center rounded-full border border-white/50 bg-black/45 text-white opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100"><Play className="ml-0.5 h-5 w-5 fill-current" /></span></div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

export function CinematicSeparator({ src }: { src: "/background1.mp4" | "/background2.mp4" }) {
  return <section aria-hidden className="relative h-40 overflow-hidden border-y border-white/[0.06] sm:h-56"><LazyVideo src={src} className="h-full w-full" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,4,6,0.78),rgba(4,4,6,0.35),rgba(4,4,6,0.78)]" /><div className="absolute inset-0 bg-gradient-to-b from-[#050506] via-transparent to-[#050506]" /></section>;
}

export function Trailer({ onDownload }: { onDownload: DownloadHandler }) {
  const { ref, near } = useNearViewport();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [finished, setFinished] = useState(false);
  return (
    <section id="trailer" className="relative overflow-hidden bg-black py-24 sm:py-32">
      <Particles count={12} color="gold" className="opacity-50" />
      <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={{ visible: { transition: { staggerChildren: 0.12 } } }} className="relative mx-auto max-w-6xl px-6 sm:px-8">
        <SectionIntro eyebrow="The story awaits" title="Watch the cinematic trailer" />
        <motion.div variants={reveal} ref={ref} className="group relative mt-14 aspect-video overflow-hidden rounded-2xl border border-white/15 bg-[#080808] shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
          {near && <video ref={videoRef} src="/Final.mp4" className="h-full w-full object-cover" controls={playing} playsInline preload="metadata" onEnded={() => { setPlaying(false); setFinished(true); }} />}
          {!playing && <button type="button" onClick={() => { setFinished(false); setPlaying(true); requestAnimationFrame(() => videoRef.current?.play().catch(() => setPlaying(false))); }} className="absolute inset-0 grid place-items-center bg-black/20 transition hover:bg-black/5" aria-label="Play cinematic trailer"><motion.span animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2.8, repeat: Infinity }} className="grid h-20 w-20 place-items-center rounded-full border border-[#f1d981]/80 bg-black/45 pl-1 text-[#f3da7f] shadow-[0_0_45px_rgba(234,194,88,0.4)]"><Play className="h-8 w-8 fill-current" /></motion.span></button>}
        </motion.div>
        <AnimatePresence>{finished && <motion.div initial={{ opacity: 0, y: 18, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }} className="mt-12 text-center"><DownloadButton onDownload={onDownload} /></motion.div>}</AnimatePresence>
      </motion.div>
    </section>
  );
}

export function DownloadSection({ onDownload, status }: { onDownload: DownloadHandler; status: "idle" | "loading" | "complete" | "error" }) {
  const benefits = ["Free Download", "Windows", "Offline Play", "No Account Required", "Controller Support", "Frequent Updates"];
  return <section id="download" className="relative isolate overflow-hidden py-24 sm:py-32"><div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(221,176,66,0.24),transparent_25%),linear-gradient(135deg,#15100a,#050506_55%,#10101a)]" /><Particles count={26} color="gold" className="-z-0" /><motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="mx-auto max-w-4xl px-6 text-center sm:px-8"><motion.p variants={reveal} className="text-xs font-bold uppercase tracking-[0.4em] text-[#edd47d]">Your journey begins now</motion.p><motion.h2 variants={reveal} className="display mt-5 text-4xl text-white sm:text-6xl">Ready to Begin Your Adventure?</motion.h2><motion.div variants={reveal} className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2">{benefits.map((benefit) => <div key={benefit} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-white/85"><Check className="h-5 w-5 text-[#ecd174]" />{benefit}</div>)}</motion.div><motion.p variants={reveal} className="mt-7 text-sm text-white/55">Estimated download: 134 MB</motion.p><motion.div variants={reveal} className="mt-5"><DownloadButton onDownload={onDownload} label={status === "loading" ? "Preparing Download" : status === "complete" ? "Download Started" : "Download Free (Windows · 134 MB)"} /></motion.div>{status === "error" && <p className="mt-4 text-sm text-red-300">The download could not be started. Please try again.</p>}</motion.div></section>;
}

export function Footer() {
  return <footer className="border-t border-white/10 bg-black px-6 py-10"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row"><div><p className="display text-lg text-white">LEGENDS OF ETERNITY</p><p className="mt-1 text-sm text-white/45">Your legend begins with a single choice.</p></div><p className="text-xs uppercase tracking-[0.22em] text-white/35">© 2026 Legends of Eternity</p></div></footer>;
}
