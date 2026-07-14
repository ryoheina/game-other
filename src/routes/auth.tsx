import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { FormEvent, useState, useEffect } from "react";
import { MouseGlow, Particles } from "@/components/fx";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Studio Admin Access — Legends of Eternity" }] }),
  component: Auth,
});

function Auth() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard", { credentials: "include" });
        if (res.ok && mounted) {
          navigate({ to: "/admin", replace: true });
        }
      } catch {
        // stay on login
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (!password) {
        throw new Error("Password is required.");
      }

      const res = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "Invalid password.");
      }
      navigate({ to: "/admin", replace: true });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Unable to authenticate.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4">
      <MouseGlow />
      <Particles count={30} color="arcane" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,oklch(0.72_0.19_245/0.18),transparent)]" />
      <div className="relative w-full max-w-md rounded-2xl glass p-8">
        <Link to="/" className="mb-6 inline-block text-xs uppercase tracking-[0.35em] text-white/50 hover:text-white">
          ← Back to site
        </Link>
        <h1 className="display text-3xl text-white">Studio Login</h1>
        <p className="mt-2 text-sm text-white/60">Enter the admin password to access your studio dashboard.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-3">
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className="w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-[color:var(--arcane)]"
          />
          {err && <div className="text-sm text-[color:var(--ember)]">{err}</div>}
          <button
            disabled={busy}
            className="w-full rounded-full bg-gradient-to-r from-[color:var(--arcane)] to-[color:var(--gold)] px-6 py-3 text-sm uppercase tracking-[0.25em] text-black transition hover:scale-[1.01] disabled:opacity-60"
          >
            {busy ? "…" : "Enter"}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/50">
          <p>Enter your admin password to access the studio dashboard.</p>
        </div>
      </div>
    </div>
  );
}
