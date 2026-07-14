import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

function createErrorPayload(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

async function clearTable(supabaseAdmin: any, table: string) {
  const res = await supabaseAdmin.from(table).delete().not("id", "is", null);
  if (res.error) throw res.error;
}

export const Route = createFileRoute("/api/admin/clear-history")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "content-type": "application/json" };
        try {
          if (!(await isAdminAuthorized(request))) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
              status: 401,
              headers,
            });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

          await clearTable(supabaseAdmin, "notifications");
          await clearTable(supabaseAdmin, "downloads");
          await clearTable(supabaseAdmin, "extractions");
          await clearTable(supabaseAdmin, "visits");

          const sessionsRes = await supabaseAdmin.from("sessions").delete().not("session_id", "is", null);
          if (sessionsRes.error) throw sessionsRes.error;

          return new Response(JSON.stringify({ success: true }), { status: 200, headers });
        } catch (error) {
          console.error("[Clear history]", error);
          return new Response(JSON.stringify(createErrorPayload(error)), { status: 500, headers });
        }
      },
    },
  },
});
