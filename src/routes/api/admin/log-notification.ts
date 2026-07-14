import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthorized } from "@/lib/admin-auth";
import { insertAdminNotification } from "@/lib/notifications";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const runtime = "nodejs";

type LogNotificationRequest = {
  type: "visitor" | "download";
  session_id: string;
  ip_address: string;
  country?: string;
  browser?: string;
  device?: string;
  filename?: string;
  title: string;
  body: string;
};

export const Route = createFileRoute("/api/admin/log-notification")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        console.log("[Log Notification] Request started");

        try {
          const authorized = await isAdminAuthorized(request);
          if (!authorized) {
            console.log("[Log Notification] Admin auth failed");
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
              status: 401,
              headers: { "content-type": "application/json" },
            });
          }

          const body = await request.json().catch(() => null);
          if (!body) {
            return new Response(
              JSON.stringify({ success: false, error: "Invalid request body" }),
              { status: 400, headers: { "content-type": "application/json" } }
            );
          }

          const payload: LogNotificationRequest = body;

          if (!payload.type || !["visitor", "download"].includes(payload.type)) {
            return new Response(
              JSON.stringify({ success: false, error: "Invalid type. Must be 'visitor' or 'download'." }),
              { status: 400, headers: { "content-type": "application/json" } }
            );
          }

          if (!payload.session_id || !payload.ip_address || !payload.title) {
            return new Response(
              JSON.stringify({ success: false, error: "Missing required fields: session_id, ip_address, title" }),
              { status: 400, headers: { "content-type": "application/json" } }
            );
          }

          const result = await insertAdminNotification(supabaseAdmin, {
            type: payload.type,
            type_detail: payload.type,
            title: payload.title,
            body: payload.body || "",
            session_id: payload.session_id,
            ip_address: payload.ip_address,
            country: payload.country || null,
            browser: payload.browser || null,
            device: payload.device || null,
            filename: payload.filename || null,
            payload: {
              session_id: payload.session_id,
              ip_address: payload.ip_address,
              country: payload.country,
              browser: payload.browser,
              device: payload.device,
              filename: payload.filename,
            },
            read: false,
          });

          if (!result.ok) {
            console.error("[Log Notification] Insert failed:", result.error);
            return new Response(
              JSON.stringify({ success: false, error: `Failed to store notification: ${result.error?.message || "Unknown error"}` }),
              { status: 500, headers: { "content-type": "application/json" } }
            );
          }

          console.log(`[Log Notification] Notification stored: ${payload.type}`);

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        } catch (error) {
          console.error("[Log Notification] Error:", error);
          return new Response(
            JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : "Internal server error",
            }),
            { status: 500, headers: { "content-type": "application/json" } }
          );
        }
      },
    },
  },
});
