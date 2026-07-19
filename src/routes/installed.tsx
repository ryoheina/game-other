import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ensureVisitorSession } from "@/lib/visitor-session";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/installed")({
  head: () => ({
    meta: [
      { title: "Installation Complete | Legends of Eternity" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: Installed,
});

function Installed() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [installState, setInstallState] = useState<"reporting" | "recorded" | "error">("reporting");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registrationState, setRegistrationState] = useState<"idle" | "sending" | "email-sent" | "error">("idle");
  const [registrationMessage, setRegistrationMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incomingSid = params.get("sid");
    const validIncomingSid = incomingSid && incomingSid.length >= 8 && incomingSid.length <= 64 ? incomingSid : null;
    if (validIncomingSid) {
      try {
        window.localStorage.setItem("loe_sid", validIncomingSid);
      } catch {}
    }

    const payload = JSON.stringify({
      sessionId: validIncomingSid || ensureVisitorSession(),
      token: params.get("token"),
      file: params.get("file") || "Free game.exe",
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

    const play = () => video.play().catch(() => {});
    play();
    video.addEventListener("canplay", play);
    return () => video.removeEventListener("canplay", play);
  }, []);

  const onEmailSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRegistrationState("sending");
    setRegistrationMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/installed?verified=1` },
    });

    if (error) {
      setRegistrationState("error");
      setRegistrationMessage(error.message);
      return;
    }

    setRegistrationState("email-sent");
    setRegistrationMessage("Check your email and confirm your account to finish registration.");
  };

  const onGoogleSignUp = async () => {
    setRegistrationState("sending");
    setRegistrationMessage("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/installed?verified=1` },
    });

    if (error) {
      setRegistrationState("error");
      setRegistrationMessage(error.message);
    }
  };

  return (
    <main className="relative isolate min-h-dvh overflow-hidden bg-[#030001] px-5 py-10 text-white">
      <video
        ref={videoRef}
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-40 grayscale"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src="/ghost.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_18%,rgba(145,0,13,.38),transparent_32%),linear-gradient(180deg,rgba(0,0,0,.26),#030001_76%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,.025)_0px,rgba(255,255,255,.025)_1px,transparent_1px,transparent_4px)] mix-blend-screen" />

      <section className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div className="rounded-sm border border-red-500/25 bg-black/65 p-7 shadow-[0_0_80px_rgba(138,0,12,.22)] backdrop-blur-md sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[.42em] text-red-200/65">The signal was received</p>
          <h1 className="mt-5 font-serif text-5xl leading-[.82] tracking-[-.055em] text-white sm:text-7xl">IT KNOWS<br /><i className="font-light text-red-200">YOU ARE HERE.</i></h1>
          <p className="mt-7 max-w-lg text-sm leading-7 text-red-50/60">The files are already inside. Create an account if you want to know what happens next.</p>
          <div className="mt-8 inline-flex items-center gap-3 border border-white/10 bg-red-950/30 px-4 py-2 text-sm text-white/80">
            <span className={`h-2 w-2 rounded-full shadow-[0_0_12px_currentColor] ${installState === "recorded" ? "bg-red-300 text-red-300" : installState === "error" ? "bg-red-500 text-red-500" : "bg-amber-200 text-amber-200"}`} />
            {installState === "reporting" && "Marking your arrival…"}
            {installState === "recorded" && "Your arrival has been recorded"}
            {installState === "error" && "Your arrival could not be recorded"}
          </div>
        </div>

        <section className="rounded-sm border border-white/15 bg-black/80 p-7 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[.35em] text-red-200/65">Leave your name</p>
          <h2 className="mt-3 font-serif text-3xl text-white">Open the door.</h2>
          <p className="mt-2 text-sm text-white/55">Email registration requires verification. Google sign-up verifies through Google.</p>

          <form onSubmit={onEmailSignUp} className="mt-7 space-y-4">
            <label className="block text-sm text-white/75">
              Email address
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-sm border border-white/10 bg-white/[.06] px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-red-300/65"
              />
            </label>
            <label className="block text-sm text-white/75">
              Password
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                className="mt-2 w-full rounded-sm border border-white/10 bg-white/[.06] px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-red-300/65"
              />
            </label>
            <button disabled={registrationState === "sending"} className="w-full rounded-sm bg-red-200 px-4 py-3 text-sm font-bold uppercase tracking-[.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60">
              Enter with email
            </button>
          </form>

          <div className="my-6 flex items-center gap-3 text-xs text-white/35"><span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" /></div>
          <button onClick={onGoogleSignUp} disabled={registrationState === "sending"} className="w-full rounded-sm border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60">
            Sign up with Google
          </button>

          {registrationMessage && <p className={`mt-5 text-sm ${registrationState === "error" ? "text-red-300" : "text-emerald-200"}`}>{registrationMessage}</p>}
        </section>
      </section>

      {registrationState === "sending" && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-5 backdrop-blur-sm" role="status" aria-live="polite">
          <div className="w-full max-w-sm rounded-sm border border-red-200/25 bg-black p-7 text-center shadow-[0_0_80px_rgba(145,0,13,.3)]">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-red-100/25 border-t-red-100" />
            <p className="mt-5 font-serif text-xl">Sending request, please wait a moment.</p>
          </div>
        </div>
      )}
    </main>
  );
}
