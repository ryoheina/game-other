import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import useAdminNotifications from "@/hooks/use-admin-notifications";
import { useDesktopNotifications } from "@/hooks/use-desktop-notifications";
import { MouseGlow } from "@/components/fx";

const KNOWN_GAME_FILE_SIZE = 134_015_488;

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Studio Dashboard — Legends of Eternity" }] }),
  component: Admin,
});

function formatDownloadBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatDownloadTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const whole = Math.round(seconds);
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return minutes > 0 ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;
}

function Admin() {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState<boolean | undefined>(undefined);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionsPage, setSessionsPage] = useState(1);
  const [downloads, setDownloads] = useState<any[]>([]);
  const [networkClusters, setNetworkClusters] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [latestAlert, setLatestAlert] = useState<any>(null);
  const { notifications, setNotifications, markRead, remove, clearAll } = useAdminNotifications([]);
  const desktopNotifState = useDesktopNotifications();
  const lastSnapshotRef = useRef<string | null>(null);
  const shownInPageNotificationIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/admin/dashboard", { credentials: "include" });
        if (res.status === 401) {
          navigate({ to: "/auth", replace: true });
          return;
        }
        if (res.ok && mounted) setAuthorized(true);
      } catch {
        navigate({ to: "/auth", replace: true });
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!authorized) return;

    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    let mounted = true;
    let pollIv: ReturnType<typeof setInterval> | null = null;

    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard", {
          credentials: "include",
          headers: { "content-type": "application/json" },
        });
        if (res.status === 401) {
          navigate({ to: "/auth", replace: true });
          return false;
        }

        if (!res.ok) {
          console.error("Dashboard API error:", res.status, res.statusText);
          if (!mounted) return true;
          setSessions([]);
          setDownloads([]);
          setNetworkClusters([]);
          setStats(null);
          setNotifications([]);
          return true;
        }

        const data = await res.json();
        if (!mounted) return true;
        setSessions(data.sessions || []);
        setDownloads(data.downloads || []);
        setNetworkClusters(data.networkClusters || []);
        setStats(data.stats || null);
        const nextNotifications = data.notifications || [];
        setNotifications(nextNotifications);

        const newestUnread = nextNotifications.find((note: any) => note.read !== true && !shownInPageNotificationIdsRef.current.has(String(note.id)));
        if (newestUnread) {
          shownInPageNotificationIdsRef.current.add(String(newestUnread.id));
          setLatestAlert(newestUnread);
          window.setTimeout(() => {
            setLatestAlert((current: any) => (current?.id === newestUnread.id ? null : current));
          }, 8000);
        }

        const snap = JSON.stringify((data.sessions || []).map((item: any) => ({ id: item.session_id, last_active: item.last_active })));
        if (lastSnapshotRef.current && lastSnapshotRef.current !== snap) {
          const prev = JSON.parse(lastSnapshotRef.current);
          const prevMap = new Map(prev.map((p: any) => [p.id, p.last_active]));
          (data.sessions || []).forEach((item: any) => {
            const prevVal = prevMap.get(item.session_id);
            if (prevVal && prevVal !== item.last_active && typeof Notification !== "undefined" && Notification.permission === "granted") {
              new Notification("Visitor activity", {
                body: `${item.ip ?? "unknown"} — ${item.device ?? item.os} — ${item.status}`,
              });
            }
          });
        }
        lastSnapshotRef.current = snap;
        return true;
      } catch (e) {
        console.error("Dashboard poll error:", e);
        if (!mounted) return false;
        setSessions([]);
        setDownloads([]);
        setNetworkClusters([]);
        setStats(null);
        setNotifications([]);
        return false;
      }
    }

    void fetchDashboard();
    pollIv = setInterval(fetchDashboard, 3000);

    return () => {
      mounted = false;
      if (pollIv) clearInterval(pollIv);
    };
  }, [authorized, navigate]);

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST", credentials: "include" }).catch(() => {});
    navigate({ to: "/auth", replace: true });
  };

  const clearAllHistory = async () => {
    const ok = window.confirm("Clear all visitor, download, extraction, and notification history? This cannot be undone.");
    if (!ok) return;

    try {
      const res = await fetch("/api/admin/clear-history", { method: "POST", credentials: "include" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        window.alert("Clear history failed: " + (body?.error || res.statusText));
        return;
      }

      setSessions([]);
      setDownloads([]);
      setNetworkClusters([]);
      setStats(null);
      setNotifications([]);
      setSessionsPage(1);
      window.alert("All history cleared");
    } catch (error) {
      window.alert("Clear history failed: " + String(error));
    }
  };

  const sessionsPerPage = 10;
  const totalSessionPages = Math.max(1, Math.ceil(sessions.length / sessionsPerPage));
  const currentSessionPage = Math.min(sessionsPage, totalSessionPages);
  const paginatedSessions = sessions.slice(
    (currentSessionPage - 1) * sessionsPerPage,
    currentSessionPage * sessionsPerPage,
  );

  useEffect(() => {
    setSessionsPage((page) => Math.min(page, Math.max(1, Math.ceil(sessions.length / sessionsPerPage))));
  }, [sessions.length]);

  if (authorized === undefined) {
    return <div className="grid min-h-dvh place-items-center text-white/60">Loading admin…</div>;
  }

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <MouseGlow />
      {latestAlert && (
        <div className="fixed right-4 top-20 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[color:var(--gold)]/40 bg-black/85 p-4 text-white shadow-[0_0_50px_rgba(255,214,120,0.22)] backdrop-blur-xl">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]">New notification</div>
          <div className="mt-2 font-semibold">{latestAlert.title || "Activity detected"}</div>
          <div className="mt-1 text-sm text-white/70">{latestAlert.body || latestAlert.filename || latestAlert.type || "New admin event"}</div>
          <button
            onClick={() => setLatestAlert(null)}
            className="mt-3 text-xs uppercase tracking-widest text-white/50 hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded-md glass glow-blue">
              <span className="display text-gradient-gold text-sm">L</span>
            </span>
            <div className="display text-xs tracking-[0.35em] text-white/80">STUDIO CONSOLE</div>
            {desktopNotifState.permission === "granted" && (
              <div className="flex items-center gap-1 ml-4 text-xs text-emerald-400">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Notifications active
              </div>
            )}
            {desktopNotifState.permission === "denied" && (
              <div className="flex items-center gap-1 ml-4 text-xs text-red-400">
                <div className="h-2 w-2 rounded-full bg-red-400" />
                Notifications denied
              </div>
            )}
            {desktopNotifState.permission === "default" && (
              <div className="flex items-center gap-1 ml-4 text-xs text-yellow-400">
                <div className="h-2 w-2 rounded-full bg-yellow-400" />
                Notifications: not granted
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white">View site</Link>
            <button onClick={signOut} className="rounded-full glass px-4 py-2 text-xs uppercase tracking-widest text-white/80 hover:text-white">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-6">
        {desktopNotifState.permission === "denied" && (
          <section className="rounded-3xl glass p-6 border border-red-400/30 bg-red-950/20 text-red-200">
            <div className="flex items-start gap-3">
              <div className="text-lg">⚠️</div>
              <div>
                <h3 className="font-semibold">Notifications Disabled</h3>
                <p className="mt-1 text-sm text-red-200/80">
                  Browser notifications have been denied. Check your browser settings to enable notifications for this site. You will receive real-time alerts for new visitors and downloads once enabled.
                </p>
                {desktopNotifState.lastError && (
                  <p className="mt-2 text-xs text-red-300 font-mono bg-black/30 p-2 rounded">{desktopNotifState.lastError}</p>
                )}
              </div>
            </div>
          </section>
        )}

        {desktopNotifState.permission === "loading" && (
          <section className="rounded-3xl glass p-6 border border-blue-400/30 bg-blue-950/20 text-blue-200">
            <div className="flex items-center gap-2">
              <div className="animate-spin text-lg">⏳</div>
              <p className="text-sm">Requesting notification permission...</p>
            </div>
          </section>
        )}
        <section className="rounded-3xl glass p-8 text-white">
          <h1 className="display text-3xl">Studio Admin Dashboard</h1>
          <p className="mt-3 text-sm text-white/70">
            You are signed in using a signed, expiring admin cookie. All admin data APIs require that cookie.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Visitors", stats?.total_sessions ?? sessions.length],
            ["Online", stats?.online_sessions ?? sessions.filter((s: any) => s.status === "online").length],
            ["Download users", stats?.download_users ?? new Set(downloads.map((d: any) => d.session_id || d.ip || d.user_id).filter(Boolean)).size],
            ["Downloads", stats?.total_downloads ?? downloads.length],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl glass p-5 text-white">
              <div className="text-[10px] uppercase tracking-[0.3em] text-white/40">{label}</div>
              <div className="mt-2 text-3xl font-semibold">{value}</div>
            </div>
          ))}
        </section>

        <section className="rounded-3xl glass p-8 text-white">
          <h2 className="text-xl font-semibold">Admin tools</h2>
          <p className="mt-2 text-sm text-white/70">This admin page is available at <code className="rounded bg-white/5 px-2 py-1">/admin</code>.</p>
          {desktopNotifState.permission === "granted" && (
            <p className="mt-2 text-xs text-emerald-300">
              ✓ Desktop notifications enabled. You will receive real-time alerts for new visitors and downloads.
              {desktopNotifState.notificationCount > 0 && ` (${desktopNotifState.notificationCount} notifications sent)`}
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearAllHistory}
              className="rounded-full border border-red-400/40 bg-red-950/30 px-4 py-2 text-xs uppercase tracking-widest text-red-200 hover:bg-red-900/40"
            >
              Clear all history
            </button>
          </div>
          <div className="mt-6 space-y-8">
            <div className="overflow-x-auto rounded-3xl bg-white/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-medium">Active visitors</h3>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  <button
                    disabled={currentSessionPage <= 1}
                    onClick={() => setSessionsPage((page) => Math.max(1, page - 1))}
                    className="rounded-full glass px-3 py-1 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentSessionPage} of {totalSessionPages}
                  </span>
                  <button
                    disabled={currentSessionPage >= totalSessionPages}
                    onClick={() => setSessionsPage((page) => Math.min(totalSessionPages, page + 1))}
                    className="rounded-full glass px-3 py-1 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
              <table className="w-full table-auto text-left text-sm text-white/80">
                <thead>
                  <tr>
                    <th className="px-2 py-2">Session</th>
                    <th className="px-2 py-2">IP</th>
                    <th className="px-2 py-2">Country</th>
                    <th className="px-2 py-2">Device</th>
                    <th className="px-2 py-2">Browser</th>
                    <th className="px-2 py-2">OS</th>
                    <th className="px-2 py-2">Install</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Status reason</th>
                    <th className="px-2 py-2">Last active</th>
                    <th className="px-2 py-2">First visit</th>
                    <th className="px-2 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSessions.map((d) => (
                    <tr key={d.session_id} className="border-t border-white/5 text-white/70">
                      <td className="px-2 py-2">{d.session_id.slice(0, 8)}</td>
                      <td className="px-2 py-2">{d.ip ?? '—'}</td>
                      <td className="px-2 py-2">{d.country ?? '—'}</td>
                      <td className="px-2 py-2">{d.device ?? '—'}</td>
                      <td className="px-2 py-2">{d.browser ?? '—'}</td>
                      <td className="px-2 py-2">{d.os ?? '—'}</td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${d.installed ? "bg-blue-500/15 text-blue-300" : "bg-red-500/15 text-red-300"}`}>
                          {d.installed ? "installed" : "non"}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <span className={`rounded-full px-2 py-1 text-xs ${d.status === "online" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/50"}`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="max-w-[220px] px-2 py-2 text-xs text-white/50">{d.status_reason ?? "—"}</td>
                      <td className="px-2 py-2">{new Date(d.last_active).toLocaleTimeString()}</td>
                      <td className="px-2 py-2">{new Date(d.first_visit).toLocaleTimeString()}</td>
                      <td className="px-2 py-2">
                        <div className="flex gap-2">
                          {d.user_id ? (
                            <button
                              onClick={async () => {
                                const ok = window.confirm('Delete user and associated data?');
                                if (!ok) return;
                                try {
                                  const res = await fetch('/api/admin/delete-user', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user_id: d.user_id }) });
                                  if (!res.ok) {
                                    const b = await res.json().catch(() => null);
                                    window.alert('Delete failed: ' + (b?.error || res.statusText));
                                  } else {
                                    window.alert('User deleted');
                                    setSessions((prev) => prev.filter((s: any) => s.user_id !== d.user_id));
                                    setDownloads((prev) => prev.filter((x: any) => x.user_id !== d.user_id));
                                    // notifications will be updated by hook
                                  }
                                } catch (e) { window.alert('Delete failed: ' + String(e)); }
                              }}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Delete user
                            </button>
                          ) : null}

                          <button
                            onClick={async () => {
                              const ok = window.confirm('Delete this session?');
                              if (!ok) return;
                              try {
                                const res = await fetch('/api/admin/delete-session', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: d.session_id }) });
                                if (!res.ok) { const b = await res.json().catch(() => null); window.alert('Delete session failed: ' + (b?.error || res.statusText)); }
                                else { setSessions((prev) => prev.filter((s: any) => s.session_id !== d.session_id)); }
                              } catch (e) { window.alert('Delete session failed: ' + String(e)); }
                            }}
                            className="text-xs text-white/60 hover:text-white"
                          >
                            Delete session
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto rounded-3xl bg-white/5 p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-medium">Network behavior clusters</h3>
                  <p className="mt-1 max-w-2xl text-xs text-white/50">
                    Groups are based on /24 subnet, ASN when available, country, city when available, and a 1-hour time window. This does not identify a person.
                  </p>
                </div>
                <div className="text-xs uppercase tracking-[0.22em] text-white/40">
                  {networkClusters.length} cluster{networkClusters.length === 1 ? "" : "s"}
                </div>
              </div>

              {networkClusters.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/50">
                  No possible related VPN/network activity detected.
                </div>
              ) : (
                <table className="mt-4 w-full table-auto text-left text-sm text-white/80">
                  <thead>
                    <tr>
                      <th className="px-2 py-2">Network cluster</th>
                      <th className="px-2 py-2">Safe label</th>
                      <th className="px-2 py-2">Subnet</th>
                      <th className="px-2 py-2">ASN</th>
                      <th className="px-2 py-2">Country</th>
                      <th className="px-2 py-2">City</th>
                      <th className="px-2 py-2">Time range</th>
                      <th className="px-2 py-2">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {networkClusters.map((cluster) => (
                      <tr key={cluster.network_cluster_id} className="border-t border-white/5 text-white/70">
                        <td className="px-2 py-2 font-mono text-xs">{cluster.network_cluster_id}</td>
                        <td className="max-w-md px-2 py-2">
                          <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-blue-100">
                            {cluster.safe_label || `Possible related VPN/network activity: [${(cluster.ip_list || []).join(", ")}]`}
                          </div>
                        </td>
                        <td className="px-2 py-2 font-mono text-xs">{cluster.subnet_24 || "—"}</td>
                        <td className="px-2 py-2">{cluster.asn && cluster.asn !== "unknown" ? cluster.asn : "—"}</td>
                        <td className="px-2 py-2">{cluster.country && cluster.country !== "unknown" ? cluster.country : "—"}</td>
                        <td className="px-2 py-2">{cluster.city && cluster.city !== "unknown" ? cluster.city : "—"}</td>
                        <td className="px-2 py-2 whitespace-nowrap">
                          {cluster.first_seen ? new Date(cluster.first_seen).toLocaleTimeString() : "—"}
                          {" - "}
                          {cluster.last_seen ? new Date(cluster.last_seen).toLocaleTimeString() : "—"}
                        </td>
                        <td className="px-2 py-2">
                          <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/70">
                            {cluster.cluster_confidence ?? 0}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="overflow-x-auto rounded-3xl bg-white/5 p-4">
              <h3 className="text-lg font-medium">Download activity</h3>
              <div className="flex justify-end mt-2">
                <button
                  onClick={async () => {
                    const ok = window.confirm('Clear all download history? This cannot be undone.');
                    if (!ok) return;
                    try {
                      const res = await fetch('/api/admin/clear-downloads', { method: 'POST', credentials: 'include' });
                      if (!res.ok) { const b = await res.json().catch(() => null); window.alert('Clear failed: ' + (b?.error || res.statusText)); }
                      else { setDownloads([]); window.alert('Downloads cleared'); }
                    } catch (e) { window.alert('Clear failed: ' + String(e)); }
                  }}
                  className="text-xs text-white/60 hover:text-white"
                >
                  Clear downloads
                </button>
              </div>
              <table className="w-full table-auto text-left text-sm text-white/80">
                <thead>
                  <tr>
                    <th className="px-2 py-2">Time</th>
                    <th className="px-2 py-2">IP</th>
                    <th className="px-2 py-2">Session</th>
                    <th className="px-2 py-2">File</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Progress</th>
                    <th className="px-2 py-2">Install</th>
                    <th className="px-2 py-2">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {downloads.map((d) => (
                      <tr key={d.id} className="border-t border-white/5 text-white/70">
                        <td className="px-2 py-2">{new Date(d.started_at ?? d.created_at).toLocaleString()}</td>
                        <td className="px-2 py-2">{d.ip ?? '—'}</td>
                        <td className="px-2 py-2">{d.session_id ? d.session_id.slice(0, 8) : '—'}</td>
                        <td className="px-2 py-2">{d.file_name}</td>
                        <td className="px-2 py-2">{d.status}</td>
                        <td className="min-w-[260px] px-2 py-2">
                          {(() => {
                            const downloadedBytes = Number(d.downloaded_bytes || 0);
                            const totalBytes = Number(d.total_bytes || 0) || (d.file_name === "LegendsofEternity.exe" ? KNOWN_GAME_FILE_SIZE : 0);
                            const storedPercent = Number(d.progress_percent || 0);
                            const bytePercent = totalBytes > 0 && downloadedBytes > 0 ? Math.round((downloadedBytes / totalBytes) * 100) : 0;
                            const elapsedSeconds = Number(d.elapsed_seconds || 0);
                            const complete = d.completed === true && (downloadedBytes > 0 || storedPercent > 0 || elapsedSeconds > 0 || Boolean(d.completed_at));
                            const percent = complete ? 100 : Math.max(0, Math.min(99, storedPercent || bytePercent));
                            return (
                              <div className="rounded-2xl border border-white/10 bg-black/25 p-3">
                                <div className="mb-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-white/55">
                                  <span>{complete ? "Complete" : `${percent}%`}</span>
                                  <span>{formatDownloadTime(elapsedSeconds)}</span>
                                </div>
                                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                  <div
                                    className="h-full rounded-full bg-gradient-to-r from-[#75d6ff] via-[#ffe08a] to-[#ff8f70] shadow-[0_0_18px_rgba(255,224,138,0.45)] transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                                <div className="mt-2 flex items-center justify-between gap-3 text-[11px] text-white/45">
                                  <span>{formatDownloadBytes(downloadedBytes)}</span>
                                  <span>{totalBytes > 0 ? formatDownloadBytes(totalBytes) : "Calculating size"}</span>
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-2 py-2">
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${d.installed ? "bg-blue-500/15 text-blue-300" : "bg-red-500/15 text-red-300"}`}>
                            {d.installed ? "installed" : "non"}
                          </span>
                        </td>
                        <td className="px-2 py-2">
                          {d.completed === true && (Number(d.downloaded_bytes || 0) > 0 || Number(d.progress_percent || 0) > 0 || Number(d.elapsed_seconds || 0) > 0 || Boolean(d.completed_at)) ? 'Yes' : 'No'}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                const ok = window.confirm('Delete this download record?');
                                if (!ok) return;
                                try {
                                  const res = await fetch('/api/admin/delete-download', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ id: d.id }) });
                                  if (!res.ok) { const b = await res.json().catch(() => null); window.alert('Delete failed: ' + (b?.error || res.statusText)); }
                                  else { setDownloads((prev) => prev.filter((x: any) => x.id !== d.id)); }
                                } catch (e) { window.alert('Delete failed: ' + String(e)); }
                              }}
                              className="text-xs text-white/60 hover:text-white"
                            >
                              Delete
                            </button>
                            {d.user_id ? (
                              <button
                                onClick={async () => {
                                  const ok = window.confirm('Delete user and associated records? This cannot be undone.');
                                  if (!ok) return;
                                  try {
                                    const res = await fetch('/api/admin/delete-user', { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ user_id: d.user_id }) });
                                    if (!res.ok) { const b = await res.json().catch(() => null); window.alert('Delete failed: ' + (b?.error || res.statusText)); }
                                    else { window.alert('User deleted'); setDownloads((prev) => prev.filter((x: any) => x.user_id !== d.user_id)); setSessions((prev) => prev.filter((s: any) => s.user_id !== d.user_id)); }
                                  } catch (e) { window.alert('Delete failed: ' + String(e)); }
                                }}
                                className="text-xs text-red-400 hover:text-red-300"
                              >
                                Delete user
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-hidden rounded-3xl bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Notifications</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      await clearAll();
                    }}
                    className="text-xs text-white/60 hover:text-white"
                  >
                    Clear all
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                {notifications.length === 0 && <div className="text-white/50">No notifications</div>}
                {notifications.map((note) => (
                  <div key={note.id} className={`rounded-2xl p-4 flex justify-between items-start border ${note.read ? 'border-white/10 bg-background/70' : 'border-accent/50 bg-accent/900'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="text-xl">{note.type_detail === "visitor" || note.payload?.type_detail === "visitor" || note.type === "visitor_arrival" || note.type === "visitor_left" ? "👤" : "📥"}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-white">{note.title}</div>
                            {!note.read && <span className="inline-block h-2 w-2 rounded-full bg-accent"></span>}
                          </div>
                          <div className="text-xs text-white/60 mt-1">{new Date(note.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70 pl-9">
                        <div>
                          <span className="text-white/50">Session:</span>
                          <div className="font-mono text-white">{(note.session_id || note.payload?.session_id)?.slice(0, 8) || '—'}</div>
                        </div>
                        <div>
                          <span className="text-white/50">IP:</span>
                          <div className="font-mono text-white">{note.ip_address || note.payload?.ip_address || "—"}</div>
                        </div>
                        <div>
                          <span className="text-white/50">Country:</span>
                          <div className="text-white">{note.country || note.payload?.country || "—"}</div>
                        </div>
                        <div>
                          <span className="text-white/50">Device:</span>
                          <div className="text-white">{note.device || note.payload?.device || '—'}</div>
                        </div>
                        <div>
                          <span className="text-white/50">Browser:</span>
                          <div className="text-white">{note.browser || note.payload?.browser || '—'}</div>
                        </div>
                        {(note.filename || note.payload?.filename) && (
                          <div>
                            <span className="text-white/50">File:</span>
                            <div className="text-white">{note.filename || note.payload?.filename}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {!note.read && (
                        <button
                          onClick={async () => {
                            await markRead(note.id);
                          }}
                          className="text-xs text-white/60 hover:text-white whitespace-nowrap"
                          title="Mark as read"
                        >
                          ✓ Mark read
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          const ok = window.confirm('Delete notification?');
                          if (!ok) return;
                          await remove(note.id);
                        }}
                        className="text-xs text-red-400 hover:text-red-300 whitespace-nowrap"
                        title="Delete this notification"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-white/70">Use the admin password to gate access to studio management content.</p>
            </div>
            <div className="rounded-2xl bg-white/5 p-4">
              <p className="text-sm text-white/70">Sign out will clear the admin cookie and return you to the login page.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
