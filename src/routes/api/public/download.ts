import { createFileRoute } from "@tanstack/react-router";
import { getClientMeta } from "@/lib/ua";
import { resolveCountry } from "@/lib/geo";
import { createInstallToken, createInstallTokenCookie } from "@/lib/install-token";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PUBLIC_ARCHIVE_NAME = "LegendsofEternity.exe";
const PUBLIC_ARCHIVE_PATH = `/${encodeURIComponent(PUBLIC_ARCHIVE_NAME)}`;
const MIN_VALID_ARCHIVE_SIZE = 1_000_000;
const KNOWN_PUBLIC_ARCHIVE_SIZE = 134_015_488;
const GITHUB_LFS_ARCHIVE_URL =
  "https://media.githubusercontent.com/media/ryoheina/game/main/public/LegendsofEternity.exe";

export const runtime = "nodejs";

function isUuid(value: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

async function getPublicArchiveSize() {
  try {
    const [{ stat }, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
    const candidates = [
      path.join(process.cwd(), "public", PUBLIC_ARCHIVE_NAME),
      path.join(process.cwd(), ".output", "public", PUBLIC_ARCHIVE_NAME),
    ];

    for (const candidate of candidates) {
      try {
        const file = await stat(candidate);
        if (file.isFile() && file.size > 0) return file.size;
      } catch {}
    }
  } catch {}

  return KNOWN_PUBLIC_ARCHIVE_SIZE;
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
          if (downloadId) {
            const updateResult = await supabaseAdmin
              .from("downloads")
              .update(getMinimalDownloadRecord(downloadRecord))
              .eq("id", downloadId)
              .select("id")
              .maybeSingle();
            if (updateResult.error || !updateResult.data?.id) downloadId = null;
            else {
              installTokenSaved = true;
              await updateDownloadProgress(downloadId, {
                total_bytes: KNOWN_PUBLIC_ARCHIVE_SIZE,
                progress_percent: 0,
                downloaded_bytes: 0,
                elapsed_seconds: 0,
              }).catch(() => {});
              await supabaseAdmin
                .from("downloads")
                .update({
                  session_id: sid,
                  device: meta.device,
                  extracted: false,
                  install_token: installToken,
                  started_at: now,
                  ...networkMeta,
                })
                .eq("id", downloadId)
                .catch?.(() => {});
            }
          }
          if (!downloadId) {
            const insertResult = await supabaseAdmin
              .from("downloads")
              .insert(getMinimalDownloadRecord(downloadRecord))
              .select("id")
              .maybeSingle();
            if (insertResult.error) throw insertResult.error;
            downloadId = insertResult.data?.id || null;
            installTokenSaved = true;
            if (downloadId) {
              await updateDownloadProgress(downloadId, {
                total_bytes: KNOWN_PUBLIC_ARCHIVE_SIZE,
                progress_percent: 0,
                downloaded_bytes: 0,
                elapsed_seconds: 0,
              }).catch(() => {});
              await supabaseAdmin
                .from("downloads")
                .update({
                  session_id: sid,
                  device: meta.device,
                  extracted: false,
                  install_token: installToken,
                  started_at: now,
                  ...networkMeta,
                })
                .eq("id", downloadId)
                .catch?.(() => {});
            }
          }
          if (downloadId) {
            installCookie = createInstallTokenCookie(installTokenSaved ? installToken : downloadId);
          }
        } catch (e) {
          console.error("download log failed", e);
        }

        const archiveUrl = new URL(PUBLIC_ARCHIVE_PATH, request.url);

        try {
          let assetResponse = await fetch(archiveUrl, {
            headers: {
              Accept: "application/octet-stream, */*",
              "x-internal-download-fetch": "1",
            },
          });

          if (!assetResponse.ok || !assetResponse.body) {
            return new Response(JSON.stringify({ success: false, error: "Game file not found." }), {
              status: 404,
              headers: {
                "content-type": "application/json",
                "Cache-Control": "no-store",
                ...(installCookie ? { "Set-Cookie": installCookie } : {}),
              },
            });
          }

          const headerContentLength = Number(assetResponse.headers.get("content-length") || "0");
          const fileContentLength = await getPublicArchiveSize();
          let contentLength = headerContentLength > 0 ? headerContentLength : fileContentLength;

          if (contentLength > 0 && contentLength < MIN_VALID_ARCHIVE_SIZE) {
            const remoteResponse = await fetch(GITHUB_LFS_ARCHIVE_URL, {
              headers: {
                Accept: "application/octet-stream, */*",
                "User-Agent": "LegendsOfEternityDownloadProxy/1.0",
              },
            });

            if (!remoteResponse.ok || !remoteResponse.body) {
              return new Response(JSON.stringify({ success: false, error: "Game file not found." }), {
                status: 404,
                headers: {
                  "content-type": "application/json",
                  "Cache-Control": "no-store",
                  ...(installCookie ? { "Set-Cookie": installCookie } : {}),
                },
              });
            }

            assetResponse = remoteResponse;
            contentLength = Number(remoteResponse.headers.get("content-length") || "0") || KNOWN_PUBLIC_ARCHIVE_SIZE;
          }

          if (downloadId && contentLength > 0) {
            await updateDownloadProgress(downloadId, {
              total_bytes: contentLength,
              progress_percent: 0,
              downloaded_bytes: 0,
              elapsed_seconds: 0,
            }).catch((e) => console.error("initial download progress update failed", e));
          }

          const { readable, writable } = new TransformStream();
          const startedAt = Date.now();
          void (async () => {
            const reader = assetResponse.body.getReader();
            const writer = writable.getWriter();
            let downloadedBytes = 0;
            let lastProgressUpdateAt = 0;

            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (!value) continue;

                downloadedBytes += value.length;

                const nowMs = Date.now();
                if (downloadId && nowMs - lastProgressUpdateAt >= 1000) {
                  lastProgressUpdateAt = nowMs;
                  const elapsedSeconds = Math.max(0, Math.round((nowMs - startedAt) / 1000));
                  const progressPercent = contentLength > 0 ? Math.min(99, Math.round((downloadedBytes / contentLength) * 100)) : 0;
                  await updateDownloadProgress(downloadId, {
                    downloaded_bytes: downloadedBytes,
                    total_bytes: contentLength,
                    progress_percent: progressPercent,
                    elapsed_seconds: elapsedSeconds,
                  }).catch((e) => console.error("download progress update failed", e));
                }

                await writer.write(value);
              }

              if (downloadId) {
                const finalServerPercent =
                  contentLength > 0 ? Math.min(99, Math.round((downloadedBytes / contentLength) * 100)) : 99;
                await updateDownloadProgress(downloadId, {
                  downloaded_bytes: downloadedBytes,
                  total_bytes: contentLength || downloadedBytes,
                  progress_percent: finalServerPercent,
                  elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
                });
              }
              await writer.close();
            } catch (e) {
              try {
                await writer.abort(e);
              } catch {}
              console.error("download stream failed", e);
            }
          })();

          const headers = new Headers({
            "Content-Type": assetResponse.headers.get("content-type") || "application/vnd.microsoft.portable-executable",
            "Content-Disposition": `attachment; filename="${downloadFileName}"`,
            "Cache-Control": "no-store",
            ...(installCookie ? { "Set-Cookie": installCookie } : {}),
          });
          if (downloadId) headers.set("X-Download-Id", downloadId);
          const contentLengthHeader = assetResponse.headers.get("content-length");
          headers.set("Content-Length", contentLengthHeader || String(contentLength || KNOWN_PUBLIC_ARCHIVE_SIZE));

          return new Response(readable, {
            status: 200,
            headers,
          });
        } catch (error) {
          console.error("[Download] public archive request failed", {
            archiveUrl: archiveUrl.toString(),
            error,
          });
          return new Response(JSON.stringify({ success: false, error: "Game file not found." }), {
            status: 404,
            headers: {
              "content-type": "application/json",
              "Cache-Control": "no-store",
            },
          });
        }
      },
    },
  },
});
