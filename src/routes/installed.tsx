import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
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
      file: params.get("file") || "LegendsofEternity.exe",
    });
    const reportInstalled = () =>
      fetch("/api/public/installed", {
        method: "POST",
        credentials: "same-origin",
        keepalive: true,
        headers: { "content-type": "application/json" },
        body: payload,
      });

    reportInstalled().catch(() => {
      window.setTimeout(() => reportInstalled().catch(() => {}), 1200);
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
    <main className="grid min-h-dvh place-items-center overflow-hidden bg-black">
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
        <source src="/background2.mp4" type="video/mp4" />
      </video>
    </main>
  );
}
