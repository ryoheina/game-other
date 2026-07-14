import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";

export const Route = createFileRoute("/me")({
  component: Me,
});

type Stats = {
  totals: { visits: number; today: number; online: number; downloads: number };
  recentVisits: any[];
  recentDownloads: any[];
};

function Me() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me/stats", { credentials: "same-origin" });
      if (res.status === 401) {
        setStats(null);
        setError("Please log in");
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Unknown");
      setStats(data as Stats);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const id = setInterval(fetchStats, 5000);
    return () => clearInterval(id);
  }, [fetchStats]);

  const submitLogin = useCallback(async (e?: Event) => {
    e?.preventDefault?.();
    setError(null);
    try {
      const res = await fetch("/api/me/login", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      await fetchStats();
    } catch (e: any) {
      setError(e?.message || String(e));
    }
  }, [password, fetchStats]);

  const logout = useCallback(async () => {
    await fetch("/api/me/logout", { method: "POST", credentials: "include" });
    setStats(null);
    setPassword("");
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin — Analytics (/me)</h1>
      {error && <div className="mb-4 text-red-600">{error}</div>}
      {!stats ? (
        <form onSubmit={(e) => { e.preventDefault(); submitLogin(); }} className="space-y-3">
          <label className="block">
            <div className="text-sm mb-1">Admin Password</div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border p-2 w-full" />
          </label>
          <div>
            <button className="px-4 py-2 bg-blue-600 text-white" onClick={(e) => { e.preventDefault(); submitLogin(); }}>Log in</button>
          </div>
        </form>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm">Visits</div>
              <div className="text-xl font-semibold">{stats.totals.visits}</div>
            </div>
            <div>
              <div className="text-sm">Today</div>
              <div className="text-xl font-semibold">{stats.totals.today}</div>
            </div>
            <div>
              <div className="text-sm">Online</div>
              <div className="text-xl font-semibold">{stats.totals.online}</div>
            </div>
            <div>
              <div className="text-sm">Downloads</div>
              <div className="text-xl font-semibold">{stats.totals.downloads}</div>
            </div>
            <div>
              <button className="px-3 py-1 border" onClick={logout}>Log out</button>
            </div>
          </div>

          <section className="mb-6">
            <h2 className="font-semibold mb-2">Recent Visits</h2>
            <ul className="space-y-2">
              {stats.recentVisits.map((v, i) => (
                <li key={i} className="text-sm border p-2 rounded">{v.ip ?? 'unknown'} — {v.path ?? '/'} — {new Date(v.created_at).toLocaleString()}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="font-semibold mb-2">Recent Downloads</h2>
            <ul className="space-y-2">
              {stats.recentDownloads.map((d, i) => (
                <li key={i} className="text-sm border p-2 rounded">{d.ip ?? 'unknown'} — {d.file_name ?? 'file'} — {new Date(d.created_at).toLocaleString()}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
      {loading && <div className="mt-4 text-sm text-gray-500">Refreshing…</div>}
    </div>
  );
}
