import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const runtime = "nodejs";

function createErrorPayload(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const payload: { success: false; error: string; stack?: string } = { success: false, error: message };
  if (process.env.NODE_ENV === "development" && error instanceof Error && error.stack) {
    payload.stack = error.stack;
  }
  return payload;
}

export const Route = createFileRoute("/api/admin/delete-download")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "content-type": "application/json" };
        try {
          if (!(await isAdminAuthorized(request))) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers });
          }

          const body = await request.json().catch(() => null);
          const id = body?.id;
          if (!id) return new Response(JSON.stringify({ success: false, error: "Missing id" }), { status: 400, headers });

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const res = await supabaseAdmin.from("downloads").delete().eq("id", id);
          if (res.error) return new Response(JSON.stringify(createErrorPayload(res.error)), { status: 500, headers });

          return new Response(JSON.stringify({ success: true }), { status: 200, headers });
        } catch (error) {
          console.error("[Delete download]", error);
          return new Response(JSON.stringify(createErrorPayload(error)), { status: 500, headers });
        }
      },
    },
  },
});
