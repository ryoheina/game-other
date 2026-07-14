import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getClientMeta } from "@/lib/ua";
import { resolveCountry } from "@/lib/geo";

export const runtime = "nodejs";

const PUBLIC_ARCHIVE_NAME = "LegendsofEternity.exe";
const KNOWN_PUBLIC_ARCHIVE_SIZE = 134_015_488;

function cleanNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : fallback;
}

function stripUnavailableColumns(data: Record<string, unknown>, errorMessage: string) {
  const next = { ...data };
  if (/downloaded_bytes|total_bytes|progress_percent|elapsed_seconds/i.test(errorMessage)) {
    delete next.downloaded_bytes;
    delete next.total_bytes;
    delete next.progress_percent;
    delete next.elapsed_seconds;
  }
  if (/completed_at/i.test(errorMessage)) delete next.completed_at;
  if (/completed/i.test(errorMessage)) delete next.completed;
  return next;
}

async function updateDownloadById(id: string, data: Record<string, unknown>) {
  let updateData = { ...data };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const result = await supabaseAdmin.from("downloads").update(updateData).eq("id", id).select("id").maybeSingle();
    if (!result.error && result.data?.id) return result.data.id as string;
    if (!result.error) return null;

    console.error("[Download progress] update failed", result.error.message);
    const stripped = stripUnavailableColumns(updateData, result.error.message);
    if (JSON.stringify(stripped) === JSON.stringify(updateData)) return null;
    updateData = stripped;
  }
  return null;
}

async function updateDownload(downloadId: string | null, sessionId: string | null, data: Record<string, unknown>) {
  if (downloadId) {
    const byId = await updateDownloadById(downloadId, data);
    if (byId) return byId;
  }

  if (sessionId) {
    let latest = await supabaseAdmin
      .from("downloads")
      .select("id")
      .eq("session_id", sessionId)
      .eq("file_name", PUBLIC_ARCHIVE_NAME)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (latest.error && /started_at|schema cache|column .* does not exist|Could not find .* column/i.test(latest.error.message)) {
      latest = await supabaseAdmin
        .from("downloads")
        .select("id")
        .eq("session_id", sessionId)
        .eq("file_name", PUBLIC_ARCHIVE_NAME)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
    }

    if (!latest.error && latest.data?.id) {
      const bySession = await updateDownloadById(latest.data.id, data);
      if (bySession) return bySession;
    }
    if (latest.error) console.error("[Download progress] lookup by session failed", latest.error.message);
  }

  return null;
}

async function insertFallbackDownload(request: Request, sessionId: string | null, data: Record<string, unknown>) {
  const meta = getClientMeta(request);
  const country = meta.country ?? (await resolveCountry(request.headers, meta.ip));
  const minimalRecord = {
    file_name: PUBLIC_ARCHIVE_NAME,
    ip: meta.ip,
    country,
    browser: meta.browser,
    os: meta.os,
    user_agent: meta.ua,
  };

  const result = await supabaseAdmin.from("downloads").insert(minimalRecord).select("id").maybeSingle();
  if (result.error) throw result.error;

  const id = result.data?.id ?? null;
  if (id) {
    await updateDownloadById(id, {
      session_id: sessionId,
      device: meta.device,
      started_at: new Date().toISOString(),
      ...data,
    });
  }
  return id;
}

export const Route = createFileRoute("/api/public/download-progress")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null);
          const downloadId = typeof body?.downloadId === "string" && body.downloadId ? body.downloadId : null;
          const sessionId = typeof body?.sessionId === "string" && body.sessionId ? body.sessionId : null;
          const downloadedBytes = Math.round(cleanNumber(body?.downloadedBytes));
          const totalBytes = Math.round(cleanNumber(body?.totalBytes, KNOWN_PUBLIC_ARCHIVE_SIZE) || KNOWN_PUBLIC_ARCHIVE_SIZE);
          const elapsedSeconds = Math.round(cleanNumber(body?.elapsedSeconds));
          const completed = body?.completed === true;
          const progressPercent = completed
            ? 100
            : Math.max(0, Math.min(99, Math.round(cleanNumber(body?.percent) || (totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0))));

          const data: Record<string, unknown> = {
            downloaded_bytes: downloadedBytes,
            total_bytes: totalBytes,
            progress_percent: progressPercent,
            elapsed_seconds: elapsedSeconds,
            completed,
            ...(completed ? { completed_at: new Date().toISOString() } : {}),
          };

          let id = await updateDownload(downloadId, sessionId, data);
          if (!id && body?.create === true) {
            id = await insertFallbackDownload(request, sessionId, {
              ...data,
              completed,
              progress_percent: completed ? 100 : 0,
              downloaded_bytes: completed ? downloadedBytes : 0,
              elapsed_seconds,
            });
          }

          return new Response(JSON.stringify({ success: true, downloadId: id }), {
            headers: { "content-type": "application/json", "Cache-Control": "no-store" },
          });
        } catch (error) {
          console.error("[Download progress] update failed", error);
          return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "content-type": "application/json", "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});
