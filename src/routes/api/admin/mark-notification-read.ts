import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

function createErrorPayload(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, error: message };
}

export const Route = createFileRoute("/api/admin/mark-notification-read")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "content-type": "application/json" };
        try {
          if (!(await isAdminAuthorized(request))) return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers });
          const body = await request.json().catch(() => null);
          const id = body?.id;
          if (!id) return new Response(JSON.stringify({ success: false, error: "Missing id" }), { status: 400, headers });
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const res = await supabaseAdmin.from("notifications").update({ read: true }).eq("id", id);
          if (res.error) return new Response(JSON.stringify(createErrorPayload(res.error)), { status: 500, headers });
          return new Response(JSON.stringify({ success: true }), { status: 200, headers });
        } catch (error) {
          console.error("[Mark notification read]", error);
          return new Response(JSON.stringify(createErrorPayload(error)), { status: 500, headers });
        }
      },
    },
  },
});
