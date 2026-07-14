import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { insertAdminNotification } from "@/lib/notifications";

export const runtime = "nodejs";

const ONLINE_WINDOW_MS = 30 * 60 * 1000;
const OFFLINE_NOTIFICATION_WINDOW_MS = 30 * 60 * 1000;

function getEnvPresence() {
  return {
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD || process.env.STUDIO_ADMIN_PASSWORD),
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
  };
}

function logAdminRouteFailure(error: unknown, context: Record<string, unknown> = {}) {
  const payload = {
    route: "/api/admin/dashboard",
    env: getEnvPresence(),
    nodeEnv: process.env.NODE_ENV ?? "undefined",
    vercelEnv: process.env.VERCEL_ENV ?? "undefined",
    ...context,
  };

  if (error instanceof Error) {
    console.error("[Admin dashboard] Runtime exception", {
      ...payload,
      message: error.message,
      name: error.name,
      stack: error.stack,
    });
    console.error(error);
    return;
  }

  console.error("[Admin dashboard] Runtime exception", {
    ...payload,
    error,
  });
}

function getStatusInfo(session: any) {
  if (session.notified_left === true) {
    return {
      status: "offline",
      reason: "Explicit page leave signal received",
    };
  }

  const lastActive = session.last_active;
  const last = new Date(lastActive).getTime();
  if (Number.isNaN(last)) {
    return {
      status: "offline",
      reason: "Invalid last_active timestamp",
    };
  }

  const ageMs = Date.now() - last;
  return {
    status: ageMs <= ONLINE_WINDOW_MS ? "online" : "offline",
    reason: ageMs <= ONLINE_WINDOW_MS
      ? `Heartbeat seen within ${Math.round(ONLINE_WINDOW_MS / 60000)} minutes`
      : `No heartbeat for ${Math.round(ageMs / 60000)} minutes`,
  };
}

function notificationIsUnread(notification: any) {
  return notification.read !== true;
}

type DashboardSuccessResponse = {
  success: true;
  sessions: any[];
  downloads: any[];
  notifications: any[];
  networkClusters: any[];
  stats: {
    total_sessions: number;
    online_sessions: number;
    total_downloads: number;
    download_users: number;
    completed_downloads: number;
    pending_notifications: number;
  };
};

type DashboardFailureResponse = {
  success: false;
  error: string;
  stack?: string;
  step?: string;
  details?: string;
  table?: string;
  column?: string;
};

const requiredEnvVars = ["ADMIN_PASSWORD", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;

type DashboardEnvInfo = {
  SUPABASE_URL: boolean;
  SUPABASE_SERVICE_ROLE_KEY: boolean;
  SUPABASE_PUBLISHABLE_KEY: boolean;
  ADMIN_PASSWORD: boolean;
  NODE_ENV: string;
  VERCEL: string;
  VERCEL_ENV: string;
  runtime: string;
  cwd: string;
  errors: Array<{ step: string; message: string; stack?: string; missing?: string[] }>;
  missing?: string[];
};

function logEnvStatus() {
  const status = requiredEnvVars
    .map((name) => `${name}=${process.env[name] ? "set" : "missing"}`)
    .join(", ");
  console.log(`[Dashboard] Required env vars: ${status}`);
}

function buildEnvInfo(errors: DashboardEnvInfo["errors"], missing?: string[]): DashboardEnvInfo {
  const runtime = typeof process !== "undefined" && process.release?.name ? `${process.release.name} ${process.version}` : "unknown";
  const cwd = typeof process !== "undefined" && typeof process.cwd === "function" ? process.cwd() : "unknown";

  return {
    SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
    SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD || process.env.STUDIO_ADMIN_PASSWORD),
    NODE_ENV: process.env.NODE_ENV ?? "undefined",
    VERCEL: process.env.VERCEL ?? "undefined",
    VERCEL_ENV: process.env.VERCEL_ENV ?? "undefined",
    runtime,
    cwd,
    errors,
    missing,
  };
}

function createFailureResponse(message: string, step: string, error?: unknown, details?: string, table?: string, column?: string): DashboardFailureResponse {
  const errorMessage = error instanceof Error ? error.message : typeof error === "string" ? error : message;
  const stack = process.env.NODE_ENV === "development" && error instanceof Error && error.stack ? error.stack : undefined;
  return {
    success: false,
    error: errorMessage,
    ...(stack ? { stack } : {}),
    step,
    details,
    table,
    column,
  };
}

function parsePostgresError(errorMessage: string) {
  const tableMatch = /relation "([^"]+)" does not exist/.exec(errorMessage) || /table "([^"]+)" does not exist/.exec(errorMessage);
  const columnMatch = /column "([^"]+)" does not exist/.exec(errorMessage);
  return {
    table: tableMatch?.[1],
    column: columnMatch?.[1],
  };
}

function extractErrorLocation(stack?: string) {
  if (!stack) return "unknown location";
  const lines = stack.split("\n").slice(1);
  const firstFrame = lines.find((line) => line.includes("src/")) || lines[0];
  return firstFrame ? firstFrame.trim() : "unknown location";
}

function getVisitIp(row: any) {
  return row.visible_ip || row.ip || row.ip_address || null;
}

function getVisitCountry(row: any) {
  return row.ip_country || row.country || null;
}

function getVisitCity(row: any) {
  return row.ip_city || row.city || null;
}

function getVisitTimestamp(row: any) {
  return row.timestamp || row.created_at || row.first_visit || row.started_at || null;
}

function getIpv4Subnet24(ip: string | null) {
  if (!ip) return null;
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const octets = parts.map((part) => Number(part));
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return null;
  return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
}

function getHourBucket(timestamp: string | null) {
  if (!timestamp) return null;
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return null;
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

function hashClusterKey(input: string) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `net_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function buildNetworkClusters(rows: any[]) {
  const groups = new Map<string, any>();

  for (const row of rows) {
    const ip = getVisitIp(row);
    const subnet24 = getIpv4Subnet24(ip);
    const hourBucket = getHourBucket(getVisitTimestamp(row));
    if (!ip || !subnet24 || !hourBucket) continue;

    const asn = row.asn ? String(row.asn) : "unknown";
    const country = getVisitCountry(row) || "unknown";
    const city = getVisitCity(row) || "unknown";
    const isp = row.isp || "unknown";
    const key = [subnet24, asn, country, city, hourBucket].join("|");
    const existing = groups.get(key) || {
      network_cluster_id: hashClusterKey(key),
      subnet_24: subnet24,
      asn,
      country,
      city,
      isp,
      hour_bucket: hourBucket,
      first_seen: getVisitTimestamp(row),
      last_seen: getVisitTimestamp(row),
      visit_count: 0,
      distinct_ips: new Set<string>(),
    };

    const timestamp = getVisitTimestamp(row);
    existing.visit_count += 1;
    existing.distinct_ips.add(ip);
    if (timestamp && (!existing.first_seen || new Date(timestamp) < new Date(existing.first_seen))) existing.first_seen = timestamp;
    if (timestamp && (!existing.last_seen || new Date(timestamp) > new Date(existing.last_seen))) existing.last_seen = timestamp;
    groups.set(key, existing);
  }

  return Array.from(groups.values())
    .map((group) => {
      const ip_list = Array.from(group.distinct_ips).sort();
      const confidenceParts = [
        group.subnet_24 !== "unknown",
        group.asn !== "unknown",
        group.country !== "unknown",
        group.city !== "unknown",
      ].filter(Boolean).length;

      return {
        network_cluster_id: group.network_cluster_id,
        subnet_24: group.subnet_24,
        asn: group.asn,
        country: group.country,
        city: group.city,
        isp: group.isp,
        hour_bucket: group.hour_bucket,
        first_seen: group.first_seen,
        last_seen: group.last_seen,
        visit_count: group.visit_count,
        distinct_ip_count: ip_list.length,
        ip_list,
        cluster_confidence: Math.round((confidenceParts / 4) * 100),
        safe_label: `Possible related VPN/network activity: [${ip_list.join(", ")}]`,
      };
    })
    .sort((a, b) => new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime())
    .slice(0, 25);
}

function getDownloadTime(download: any) {
  const value = download.started_at || download.created_at || download.completed_at;
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getDownloadRank(download: any) {
  const downloadedBytes = Number(download.downloaded_bytes || 0);
  const progressPercent = Number(download.progress_percent || 0);
  const elapsedSeconds = Number(download.elapsed_seconds || 0);
  const hasProgressEvidence = downloadedBytes > 0 || progressPercent > 0 || elapsedSeconds > 0;
  const completedRank = download.completed === true && hasProgressEvidence ? 1_000_000_000 : 0;
  return completedRank + progressPercent * 1_000_000 + downloadedBytes;
}

function collapseDuplicateDownloads(downloads: any[]) {
  const groups = new Map<string, any[]>();
  for (const download of downloads) {
    const key = [download.session_id || download.ip || "unknown", download.file_name || "unknown"].join("|");
    const group = groups.get(key) || [];
    group.push(download);
    groups.set(key, group);
  }

  return Array.from(groups.values())
    .map((group) =>
      group
        .slice()
        .sort((a, b) => {
          const timeDiff = getDownloadTime(b) - getDownloadTime(a);
          if (Math.abs(timeDiff) > 10_000) return timeDiff;
          const rankDiff = getDownloadRank(b) - getDownloadRank(a);
          if (rankDiff !== 0) return rankDiff;
          return timeDiff;
        })[0],
    )
    .sort((a, b) => getDownloadTime(b) - getDownloadTime(a));
}

function normalizeFileName(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : "legendsofeternity.exe";
}

function getInstallEventTime(event: any) {
  const value = event.created_at || event.inserted_at || event.timestamp;
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getInstallEventFile(event: any) {
  return normalizeFileName(event.file_name || event.filename || event.payload?.file_name);
}

function getVisitPath(event: any) {
  const path = event.path || event.pathname || event.url || event.payload?.path;
  if (typeof path !== "string") return "";
  try {
    return path.startsWith("http") ? new URL(path).pathname : path;
  } catch {
    return path;
  }
}

function installEventMatchesDownload(event: any, download: any) {
  if (getInstallEventFile(event) !== normalizeFileName(download.file_name)) return false;

  if (event.download_id && download.id && event.download_id === download.id) return true;
  if (event.payload?.download_id && download.id && event.payload.download_id === download.id) return true;
  if (event.session_id && download.session_id && event.session_id === download.session_id) return true;
  if (event.payload?.session_id && download.session_id && event.payload.session_id === download.session_id) return true;
  if ((event.ip || event.ip_address || event.payload?.ip_address) && download.ip) {
    const eventIp = event.ip || event.ip_address || event.payload?.ip_address;
    if (eventIp === download.ip) return true;
  }

  const eventTime = getInstallEventTime(event);
  const downloadTime = getDownloadTime(download);
  const oneDayMs = 24 * 60 * 60 * 1000;
  return eventTime > 0 && downloadTime > 0 && eventTime >= downloadTime && eventTime - downloadTime <= oneDayMs;
}

async function verifyDatabaseConnectivity(supabaseAdmin: any) {
  console.log("[Dashboard] Verifying database connectivity using sessions table...");
  const res = await supabaseAdmin.from("sessions").select("session_id").limit(1);
  if (res.error) {
    const parsed = parsePostgresError(res.error.message);
    console.error("[Dashboard] Database connectivity check failed:", res.error.message);
    return {
      ok: false,
      error: res.error,
      table: parsed.table,
      column: parsed.column,
      details: res.error.message,
    };
  }
  console.log("[Dashboard] Database connectivity verified");
  return { ok: true };
}

export const Route = createFileRoute("/api/admin/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const responseHeaders = { "content-type": "application/json", "Cache-Control": "no-store" };
        logEnvStatus();
        console.error("[Admin dashboard] Request started", {
          route: "/api/admin/dashboard",
          env: getEnvPresence(),
          nodeEnv: process.env.NODE_ENV ?? "undefined",
          vercelEnv: process.env.VERCEL_ENV ?? "undefined",
          requestUrl: request.url,
        });

        try {
          // ===== STEP 1: VALIDATE REQUIRED ENVIRONMENT =====
          const missingEnv = requiredEnvVars.filter((name) => !process.env[name]);
          if (missingEnv.length > 0) {
            const message = `Missing required environment variables: ${missingEnv.join(", ")}`;
            console.error("[Dashboard]", message);
            logAdminRouteFailure(new Error(message), { stage: "validate_env", missingEnv });
            return new Response(JSON.stringify(createFailureResponse(message, "validate_env", new Error(message))), {
              status: 500,
              headers: responseHeaders,
            });
          }

          // ===== STEP 2: AUTHORIZATION =====
          try {
            if (!(await isAdminAuthorized(request))) {
              console.warn("[Dashboard] Unauthorized access attempt");
              return new Response(JSON.stringify(createFailureResponse("Unauthorized", "authorize", undefined, "Admin auth failed")), {
                status: 401,
                headers: responseHeaders,
              });
            }
          } catch (authError) {
            const message = authError instanceof Error ? authError.message : String(authError);
            const location = extractErrorLocation(authError instanceof Error ? authError.stack : undefined);
            console.error("[Dashboard] Authorization failed:", message, location);
            logAdminRouteFailure(authError, { stage: "authorize", message, location });
            return new Response(JSON.stringify(createFailureResponse("Authentication failed", "authorize", authError, message)), {
              status: 401,
              headers: responseHeaders,
            });
          }

          // ===== STEP 3: LOAD DATABASE CLIENT =====
          let supabaseAdmin: any;
          try {
            console.log("[Dashboard] Importing Supabase admin client");
            const imported = await import("@/integrations/supabase/client.server");
            supabaseAdmin = imported.supabaseAdmin;
            if (!supabaseAdmin) {
              throw new Error("Supabase admin client import returned undefined");
            }
          } catch (importError) {
            const message = importError instanceof Error ? importError.message : String(importError);
            const stack = importError instanceof Error ? importError.stack || message : String(importError);
            console.error("[Dashboard] Supabase client import failed:", message, stack);
            logAdminRouteFailure(importError, { stage: "load_client", message, stack });
            return new Response(JSON.stringify(createFailureResponse("Database client unavailable", "load_client", importError, message)), {
              status: 500,
              headers: responseHeaders,
            });
          }

          // ===== STEP 4: CHECK DATABASE CONNECTIVITY =====
          const connectivity = await verifyDatabaseConnectivity(supabaseAdmin);
          if (!connectivity.ok) {
            const message = connectivity.details || "Database connectivity check failed";
            logAdminRouteFailure(connectivity.error, { stage: "database_connectivity", message, table: connectivity.table, column: connectivity.column });
            return new Response(JSON.stringify(createFailureResponse(message, "database_connectivity", connectivity.error, connectivity.details, connectivity.table, connectivity.column)), {
              status: 500,
              headers: responseHeaders,
            });
          }

          // ===== STEP 5: FETCH DATA =====
          console.log("[Dashboard] Executing sessions query");
          const sessionsRes = await supabaseAdmin.from("sessions").select("*").order("last_active", { ascending: false });
          if (sessionsRes.error) {
            const parsed = parsePostgresError(sessionsRes.error.message);
            console.error("[Dashboard] Sessions query failed:", sessionsRes.error.message);
            logAdminRouteFailure(sessionsRes.error, { stage: "query_sessions", table: parsed.table, column: parsed.column, message: sessionsRes.error.message });
            return new Response(JSON.stringify(createFailureResponse("Sessions query failed", "query_sessions", sessionsRes.error, sessionsRes.error.message, parsed.table, parsed.column)), {
              status: 500,
              headers: responseHeaders,
            });
          }
          const sessions: any[] = sessionsRes.data ?? [];
          console.log(`[Dashboard] Sessions fetched: ${sessions.length}`);

          console.log("[Dashboard] Executing downloads query");
          let downloadsRes = await supabaseAdmin.from("downloads").select("*").order("started_at", { ascending: false }).limit(100);
          if (downloadsRes.error && /started_at|schema cache|column .* does not exist|Could not find .* column/i.test(downloadsRes.error.message)) {
            downloadsRes = await supabaseAdmin.from("downloads").select("*").order("created_at", { ascending: false }).limit(100);
          }
          if (downloadsRes.error) {
            const parsed = parsePostgresError(downloadsRes.error.message);
            console.error("[Dashboard] Downloads query failed:", downloadsRes.error.message);
            logAdminRouteFailure(downloadsRes.error, { stage: "query_downloads", table: parsed.table, column: parsed.column, message: downloadsRes.error.message });
            return new Response(JSON.stringify(createFailureResponse("Downloads query failed", "query_downloads", downloadsRes.error, downloadsRes.error.message, parsed.table, parsed.column)), {
              status: 500,
              headers: responseHeaders,
            });
          }
          const downloads: any[] = downloadsRes.data ?? [];
          console.log(`[Dashboard] Downloads fetched: ${downloads.length}`);

          console.log("[Dashboard] Executing extractions query");
          const extractionsRes = await supabaseAdmin.from("extractions").select("*").order("created_at", { ascending: false }).limit(200);
          if (extractionsRes.error) {
            const parsed = parsePostgresError(extractionsRes.error.message);
            console.error("[Dashboard] Extractions query failed:", extractionsRes.error.message);
            logAdminRouteFailure(extractionsRes.error, { stage: "query_extractions", table: parsed.table, column: parsed.column, message: extractionsRes.error.message });
            return new Response(JSON.stringify(createFailureResponse("Extractions query failed", "query_extractions", extractionsRes.error, extractionsRes.error.message, parsed.table, parsed.column)), {
              status: 500,
              headers: responseHeaders,
            });
          }
          const extractions: any[] = extractionsRes.data ?? [];
          console.log(`[Dashboard] Extractions fetched: ${extractions.length}`);

          console.log("[Dashboard] Executing notifications query");
          const notificationsRes = await supabaseAdmin.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
          if (notificationsRes.error) {
            const parsed = parsePostgresError(notificationsRes.error.message);
            console.error("[Dashboard] Notifications query failed:", notificationsRes.error.message);
            logAdminRouteFailure(notificationsRes.error, { stage: "query_notifications", table: parsed.table, column: parsed.column, message: notificationsRes.error.message });
            return new Response(JSON.stringify(createFailureResponse("Notifications query failed", "query_notifications", notificationsRes.error, notificationsRes.error.message, parsed.table, parsed.column)), {
              status: 500,
              headers: responseHeaders,
            });
          }
          const notifications: any[] = notificationsRes.data ?? [];
          console.log(`[Dashboard] Notifications fetched: ${notifications.length}`);

          console.log("[Dashboard] Executing visits query for network activity clusters");
          const visitsRes = await supabaseAdmin.from("visits").select("*").order("created_at", { ascending: false }).limit(500);
          if (visitsRes.error) {
            const parsed = parsePostgresError(visitsRes.error.message);
            console.warn("[Dashboard] Visits query for network clusters failed:", visitsRes.error.message);
            logAdminRouteFailure(visitsRes.error, { stage: "query_network_clusters", table: parsed.table, column: parsed.column, message: visitsRes.error.message });
          }
          const visits: any[] = visitsRes.data ?? [];
          const networkClusters = buildNetworkClusters([
            ...visits,
            ...sessions.map((session: any) => ({
              ...session,
              created_at: session.first_visit,
            })),
          ]);
          console.log(`[Dashboard] Network clusters built: ${networkClusters.length}`);

          // ===== STEP 6: PROCESS RESULTS =====
          const installedSessionIds = new Set([
            ...downloads
              .filter((download: any) => download.extracted === true)
              .map((download: any) => download.session_id)
              .filter(Boolean),
            ...extractions.map((extraction: any) => extraction.session_id).filter(Boolean),
            ...notifications
              .filter((notification: any) => notification.type === "installed" || notification.title === "Game Installed")
              .map((notification: any) => notification.session_id || notification.payload?.session_id)
              .filter(Boolean),
          ]);
          const installedDownloadIds = new Set([
            ...downloads
              .filter((download: any) => download.extracted === true)
              .map((download: any) => download.id)
              .filter(Boolean),
            ...extractions.map((extraction: any) => extraction.download_id).filter(Boolean),
            ...notifications
              .filter((notification: any) => notification.type === "installed" || notification.title === "Game Installed")
              .map((notification: any) => notification.payload?.download_id)
              .filter(Boolean),
          ]);
          const installedIps = new Set([
            ...downloads
              .filter((download: any) => download.extracted === true)
              .map((download: any) => download.ip)
              .filter(Boolean),
            ...extractions.map((extraction: any) => extraction.ip).filter(Boolean),
            ...notifications
              .filter((notification: any) => notification.type === "installed" || notification.title === "Game Installed")
              .map((notification: any) => notification.ip_address || notification.payload?.ip_address)
              .filter(Boolean),
          ]);
          const installedVisitEvents = visits.filter((visit: any) => getVisitPath(visit) === "/installed");
          for (const visit of installedVisitEvents) {
            if (visit.session_id) installedSessionIds.add(visit.session_id);
            if (visit.ip) installedIps.add(visit.ip);
          }
          const installedEvents = [
            ...extractions,
            ...installedVisitEvents.map((visit: any) => ({
              ...visit,
              file_name: "LegendsofEternity.exe",
            })),
            ...notifications
              .filter((notification: any) => notification.type === "installed" || notification.title === "Game Installed")
              .map((notification: any) => ({
                ...notification,
                file_name: notification.filename || notification.payload?.file_name,
                download_id: notification.payload?.download_id,
                ip: notification.ip_address || notification.payload?.ip_address,
              })),
          ];
          for (const extraction of extractions) {
            if (extraction.session_id) installedSessionIds.add(extraction.session_id);
            if (!extraction.session_id && extraction.download_id) {
              const matchingDownload = downloads.find((download: any) => download.id === extraction.download_id);
              if (matchingDownload?.session_id) installedSessionIds.add(matchingDownload.session_id);
            }
            if (!extraction.session_id && extraction.ip) {
              for (const session of sessions) {
                if (session.ip === extraction.ip) installedSessionIds.add(session.session_id);
              }
            }
          }
          const onlineSessions = sessions.map((session: any) => {
            const statusInfo = getStatusInfo(session);
            return {
              ...session,
              installed: installedSessionIds.has(session.session_id) || (session.ip ? installedIps.has(session.ip) : false),
              status: statusInfo.status,
              status_reason: statusInfo.reason,
              last_active_time: session.last_active,
              first_visit_time: session.first_visit,
            };
          });
          const enhancedDownloadsRaw = downloads.map((download: any) => {
            const downloadedBytes = Number(download.downloaded_bytes || 0);
            const progressPercent = Number(download.progress_percent || 0);
            const elapsedSeconds = Number(download.elapsed_seconds || 0);
            const hasProgressEvidence = downloadedBytes > 0 || progressPercent > 0 || elapsedSeconds > 0;
            const inferredComplete =
              (download.completed === true && hasProgressEvidence) ||
              Boolean(download.completed_at) ||
              progressPercent >= 100;

            return {
              ...download,
              completed: inferredComplete,
              progress_percent: inferredComplete ? 100 : progressPercent,
              installed:
                download.extracted === true ||
                installedDownloadIds.has(download.id) ||
                installedSessionIds.has(download.session_id) ||
                (download.ip ? installedIps.has(download.ip) : false) ||
                installedEvents.some((event: any) => installEventMatchesDownload(event, download)),
              status: inferredComplete ? "completed" : "in_progress",
            };
          });
          const enhancedDownloads = collapseDuplicateDownloads(enhancedDownloadsRaw);
          const downloadUsers = new Set(
            enhancedDownloads
              .map((download: any) => download.session_id || download.ip || download.user_id)
              .filter(Boolean),
          ).size;
          const completedDownloads = enhancedDownloads.filter((download: any) => download.completed).length;
          const unreadNotifications = notifications.filter(notificationIsUnread);

          // ===== STEP 7: OPTIONAL BACKGROUND UPDATES =====
          try {
            const pendingOffline = sessions.filter((session: any) => session.last_active < new Date(Date.now() - OFFLINE_NOTIFICATION_WINDOW_MS).toISOString() && !session.notified_left);
            if (pendingOffline.length > 0) {
              console.log(`[Dashboard] Creating ${pendingOffline.length} offline notification(s)`);
              await Promise.all(
                pendingOffline.map((session: any) => insertAdminNotification(supabaseAdmin, {
                  type: "visitor_left",
                  type_detail: "visitor",
                  title: "Visitor Left",
                  body: `${session.ip ?? "unknown"} — ${session.country ?? "unknown"} — ${session.device ?? session.os ?? "Unknown device"}`,
                  session_id: session.session_id,
                  ip_address: session.ip,
                  country: session.country,
                  browser: session.browser,
                  device: session.device,
                  payload: { session_id: session.session_id, ip_address: session.ip, country: session.country },
                  read: false,
                  delivered: false,
                })),
              );
              await supabaseAdmin.from("sessions").update({ notified_left: true }).in("session_id", pendingOffline.map((session: any) => session.session_id));
            }
          } catch (backgroundError) {
            console.warn("[Dashboard] Background update failed:", backgroundError instanceof Error ? backgroundError.message : String(backgroundError));
          }

          const response: DashboardSuccessResponse = {
            success: true,
            sessions: onlineSessions,
            downloads: enhancedDownloads,
            notifications,
            networkClusters,
            stats: {
              total_sessions: onlineSessions.length,
              online_sessions: onlineSessions.filter((s: any) => s.status === "online").length,
              total_downloads: enhancedDownloads.length,
              download_users: downloadUsers,
              completed_downloads: completedDownloads,
              pending_notifications: unreadNotifications.length,
            },
          };

          console.log("[Dashboard] Dashboard handler completed successfully");
          return new Response(JSON.stringify(response), {
            status: 200,
            headers: responseHeaders,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          const stack = error instanceof Error ? error.stack || message : String(error);
          const location = extractErrorLocation(error instanceof Error ? error.stack : undefined);
          console.error("[Dashboard] Unhandled exception:", message, location, stack);
          logAdminRouteFailure(error, { stage: "unhandled_exception", message, location });
          return new Response(JSON.stringify(createFailureResponse(message, "unhandled_exception", error, `Unhandled exception at ${location}`)), {
            status: 500,
            headers: responseHeaders,
          });
        }
      },
    },
  },
});
