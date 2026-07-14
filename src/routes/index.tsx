import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Nav } from "@/components/nav";
import { MouseGlow } from "@/components/fx";
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
  const handleDownload = useCallback(() => {
    setDownloadStatus("loading");
    try {
      const sid = ensureVisitorSession();
      const url = `/api/public/download?sid=${encodeURIComponent(sid)}&file=LegendsofEternity.exe`;
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "LegendsofEternity.exe";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setDownloadStatus("complete");
    } catch {
      setDownloadStatus("error");
    }
  }, []);

  return <div className="min-h-screen overflow-x-clip bg-[#050506] text-white"><MouseGlow /><Nav /><main><Hero onDownload={handleDownload} /><GameplayFeatures /><CinematicSeparator src="/background1.mp4" /><BossShowcase /><GameplayGallery /><CinematicSeparator src="/background2.mp4" /><Trailer onDownload={handleDownload} /><DownloadSection onDownload={handleDownload} status={downloadStatus} /></main><AnimatePresence>{showStickyDownload && <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 18 }} className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-5 sm:right-5"><DownloadButton onDownload={handleDownload} label="Download Free" className="min-h-11 px-4 py-2.5 text-xs shadow-[0_12px_45px_rgba(0,0,0,0.45)]" /></motion.div>}</AnimatePresence><Footer /></div>;
}
