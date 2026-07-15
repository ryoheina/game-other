import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { ImmersiveBackground, MouseGlow } from "@/components/fx";
import { IntroOverlay } from "@/components/intro-overlay";
import { SiteMusic } from "@/components/site-music";
import { BossShowcase, CinematicSeparator, DownloadButton, DownloadSection, Footer, GameplayFeatures, GameplayGallery, Hero, Trailer } from "@/components/sections";
import { ensureVisitorSession } from "@/lib/visitor-session";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Legends of Eternity — A cinematic fantasy action RPG" },
    { name: "description", content: "Master brutal combat, wield forbidden magic, and begin your legend in Legends of Eternity." },
  ] }),
  component: Home,
});

function Home() {
  const [downloadStatus, setDownloadStatus] = useState<"idle" | "loading" | "complete" | "error">("idle");
  const [introComplete, setIntroComplete] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({ received: 0, total: 0 });
  const [showStickyDownload, setShowStickyDownload] = useState(false);
  useEffect(() => {
    const updateStickyButton = () => {
      const hero = document.getElementById("hero");
      setShowStickyDownload(Boolean(hero && hero.getBoundingClientRect().bottom <= 0));
    };
    updateStickyButton();
    window.addEventListener("scroll", updateStickyButton, { passive: true });
    return () => window.removeEventListener("scroll", updateStickyButton);
  }, []);
  const handleDownload = useCallback(async () => {
    setDownloadStatus("loading");
    setDownloadProgress({ received: 0, total: 0 });
    try {
      const sid = ensureVisitorSession();
      const url = `/api/public/download?sid=${encodeURIComponent(sid)}&file=LegendsofEternity.exe`;
      const response = await fetch(url, { credentials: "same-origin" });
      if (!response.ok || !response.body) throw new Error("The game file could not be downloaded");
      const total = Number(response.headers.get("content-length") || "0");
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (!value) continue;
        chunks.push(value);
        received += value.length;
        setDownloadProgress({ received, total });
      }
      const blob = new Blob(chunks, { type: response.headers.get("content-type") || "application/octet-stream" });
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);
      anchor.download = "LegendsofEternity.exe";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(anchor.href), 1_000);
      setDownloadProgress({ received: total || received, total: total || received });
      setDownloadStatus("complete");
      if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        new Notification("Download complete", { body: "Legends of Eternity is ready to install." });
      }
    } catch {
      setDownloadStatus("error");
    }
  }, []);

  const percent = downloadProgress.total > 0 ? Math.min(100, Math.round((downloadProgress.received / downloadProgress.total) * 100)) : 0;
  return <div className="relative min-h-screen overflow-x-clip bg-[#111827] text-white"><ImmersiveBackground /><IntroOverlay onComplete={() => setIntroComplete(true)} /><SiteMusic start={introComplete} /><MouseGlow /><Nav /><main><Hero onDownload={handleDownload} /><GameplayFeatures /><CinematicSeparator src="/background1.mp4" /><BossShowcase /><GameplayGallery /><CinematicSeparator src="/background2.mp4" /><Trailer onDownload={handleDownload} /><DownloadSection onDownload={handleDownload} status={downloadStatus} progress={percent} received={downloadProgress.received} total={downloadProgress.total} /></main><AnimatePresence>{downloadStatus === "complete" && <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl border border-emerald-300/40 bg-emerald-950/90 px-5 py-4 text-sm text-emerald-100 shadow-2xl backdrop-blur-xl">Congratulations — your download is complete. The game is ready to install.</motion.div>}{showStickyDownload && <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-5 sm:right-5"><DownloadButton onDownload={handleDownload} label={downloadStatus === "loading" ? `${percent}% downloading` : "Download Free"} className="min-h-11 px-4 py-2.5 text-xs shadow-[0_12px_45px_rgba(0,0,0,0.45)]" /></motion.div>}</AnimatePresence><Footer /></div>;
}
