import { createFileRoute } from "@tanstack/react-router";
import { recordVisit } from "@/lib/analytics.functions";
import { clearInstallTokenCookie, getInstallTokenFromRequest } from "@/lib/install-token";
import { getClientMeta } from "@/lib/ua";
import { insertAdminNotification } from "@/lib/notifications";

export const runtime = "nodejs";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isSchemaMismatch(error: any) {
  return /install_token|installed_at|file_name|device|schema cache|column .* does not exist|Could not find .* column/i.test(error?.message || "");
}

function isRecoverableExtractionInsertError(error: any) {
  return /foreign key|violates foreign key constraint|download_id|file_name|device|schema cache|column .* does not exist|Could not find .* column/i.test(error?.message || "");
}

async function findDownloadByInstallToken(supabaseAdmin: any, token: string) {
  const byInstallToken = await supabaseAdmin
    .from("downloads")
    .select("id,session_id,ip,file_name,install_token")
    .eq("install_token", token)
    .maybeSingle();

  if (!byInstallToken.error && byInstallToken.data) return { data: byInstallToken.data, error: null };
  if (byInstallToken.error && !isSchemaMismatch(byInstallToken.error)) return byInstallToken;

  if (!isUuid(token)) return { data: null, error: byInstallToken.error || null };
  return supabaseAdmin
    .from("downloads")
    .select("id,session_id,ip,file_name")
    .eq("id", token)
    .maybeSingle();
}

async function findLatestDownloadBySession(supabaseAdmin: any, sessionId: string | null, fileName: string) {
  if (!sessionId) return { data: null, error: null };

  let byStartedAt = await supabaseAdmin
    .from("downloads")
    .select("id,session_id,ip,file_name")
    .eq("session_id", sessionId)
    .eq("file_name", fileName)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!byStartedAt.error) return { data: byStartedAt.data, error: null };
  if (!/started_at|schema cache|column .* does not exist|Could not find .* column/i.test(byStartedAt.error.message)) {
    return byStartedAt;
  }

  return supabaseAdmin
    .from("downloads")
    .select("id,session_id,ip,file_name")
    .eq("session_id", sessionId)
    .eq("file_name", fileName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

async function findLatestDownloadByIp(supabaseAdmin: any, ip: string | null, fileName: string) {
  if (!ip) return { data: null, error: null };

  let byStartedAt = await supabaseAdmin
    .from("downloads")
    .select("id,session_id,ip,file_name")
    .eq("ip", ip)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!byStartedAt.error) return { data: byStartedAt.data, error: null };
  if (!/started_at|schema cache|column .* does not exist|Could not find .* column/i.test(byStartedAt.error.message)) {
    return byStartedAt;
  }

  return supabaseAdmin
    .from("downloads")
    .select("id,session_id,ip,file_name")
    .eq("ip", ip)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

async function findLatestDownloadByFile(supabaseAdmin: any, fileName: string) {
  let byStartedAt = await supabaseAdmin
    .from("downloads")
    .select("id,session_id,ip,file_name,started_at,created_at")
    .eq("file_name", fileName)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!byStartedAt.error) return { data: byStartedAt.data, error: null };
  if (!/started_at|schema cache|column .* does not exist|Could not find .* column/i.test(byStartedAt.error.message)) {
    return byStartedAt;
  }

  return supabaseAdmin
    .from("downloads")
    .select("id,session_id,ip,file_name,created_at")
    .eq("file_name", fileName)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

async function insertExtraction(supabaseAdmin: any, data: Record<string, unknown>) {
  let result = await supabaseAdmin.from("extractions").insert(data);
  if (!result.error || !isRecoverableExtractionInsertError(result.error)) return result;

  const fallback = { ...data };
  delete fallback.download_id;
  delete fallback.file_name;
  delete fallback.device;
  result = await supabaseAdmin.from("extractions").insert(fallback);
  return result;
}

export const Route = createFileRoute("/api/public/installed")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null);
          const fileName = typeof body?.file === "string" && body.file.trim() ? body.file.trim().slice(0, 200) : "LegendsofEternity.exe";
          const bodySessionId = typeof body?.sessionId === "string" && body.sessionId.length >= 8 && body.sessionId.length <= 64 ? body.sessionId : null;
          const meta = getClientMeta(request);
          const installToken = getInstallTokenFromRequest(request, body?.token);

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          let { data: download, error: downloadError } = installToken
            ? await findDownloadByInstallToken(supabaseAdmin, installToken)
            : await findLatestDownloadBySession(supabaseAdmin, bodySessionId, fileName);

          if (downloadError) throw downloadError;
          if (!download) {
            const byIp = await findLatestDownloadByIp(supabaseAdmin, meta.ip, fileName);
            if (byIp.error) throw byIp.error;
            download = byIp.data;
          }
          if (!download) {
            const byFile = await findLatestDownloadByFile(supabaseAdmin, fileName);
            if (byFile.error) throw byFile.error;
            download = byFile.data;
          }

          const sessionId = download?.session_id || bodySessionId;
          const installedFileName = download?.file_name || fileName;
          if (sessionId) await recordVisit(request, { sessionId, path: "/installed" });

          const installedAt = new Date().toISOString();
          if (download?.id) {
            let updateByToken = await supabaseAdmin
              .from("downloads")
              .update({ extracted: true, completed: true, completed_at: installedAt, installed_at: installedAt })
              .eq("id", download.id);
            if (updateByToken.error && isSchemaMismatch(updateByToken.error)) {
              updateByToken = await supabaseAdmin
                .from("downloads")
                .update({ extracted: true, completed: true, completed_at: installedAt })
                .eq("id", download.id);
            }
            if (updateByToken.error) throw updateByToken.error;
          }

          const extractionResult = await insertExtraction(supabaseAdmin, {
            download_id: download?.id ?? null,
            session_id: sessionId,
            ip: meta.ip,
            device: meta.device,
            file_name: installedFileName,
          });
          if (extractionResult.error) throw extractionResult.error;

          const notificationResult = await insertAdminNotification(supabaseAdmin, {
            type: "installed",
            type_detail: "installed",
            title: "Game Installed",
            body: `${sessionId ? sessionId.slice(0, 8) : meta.ip || "unknown"} - ${installedFileName}`,
            session_id: sessionId,
            ip_address: meta.ip,
            country: meta.country,
            browser: meta.browser,
            device: meta.device,
            filename: installedFileName,
            payload: {
              download_id: download?.id ?? null,
              session_id: sessionId,
              ip_address: meta.ip,
              file_name: installedFileName,
              installed: true,
              matched_download: Boolean(download?.id),
            },
            read: false,
            delivered: false,
          });
          if (!notificationResult.ok) console.error("[Installed] notification insert failed", notificationResult.error);

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "content-type": "application/json", "Cache-Control": "no-store", "Set-Cookie": clearInstallTokenCookie() },
          });
        } catch (error) {
          console.error("[Installed] tracking failed", error);
          return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "content-type": "application/json", "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});
