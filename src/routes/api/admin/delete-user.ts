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

export const Route = createFileRoute("/api/admin/delete-user")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "content-type": "application/json" };
        try {
          if (!(await isAdminAuthorized(request))) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers });
          }

          const body = await request.json().catch(() => null);
          const userId = body?.user_id;
          if (!userId || typeof userId !== "string") {
            return new Response(JSON.stringify({ success: false, error: "Missing or invalid user_id" }), { status: 400, headers });
          }

          // Load supabase admin client
          let supabaseAdmin: any;
          try {
            const imported = await import("@/integrations/supabase/client.server");
            supabaseAdmin = imported.supabaseAdmin;
            if (!supabaseAdmin) throw new Error("Supabase admin client unavailable");
          } catch (err) {
            console.error("[Delete user] Supabase admin client load failed", err);
            return new Response(JSON.stringify(createErrorPayload(err)), { status: 500, headers });
          }

          // Delete associated records first (only tables that have user_id)
          const cascadeResults: Record<string, unknown> = {};
          try {
            const nt = await supabaseAdmin.from("notifications").delete().eq("user_id", userId);
            cascadeResults.notifications = nt;
          } catch (err) {
            cascadeResults.notifications = { error: String(err) };
          }

          // Delete supabase user via admin API
          try {
            // supabase-js v2 admin API
            const res = await supabaseAdmin.auth.admin.deleteUser(userId);
            if (res?.error) {
              console.error("[Delete user] supabase.auth.admin.deleteUser error", res.error);
              return new Response(JSON.stringify({ success: false, error: res.error.message || String(res.error), details: { cascade: cascadeResults } }), { status: 500, headers });
            }
          } catch (err) {
            console.error("[Delete user] admin.deleteUser threw", err, cascadeResults);
            return new Response(JSON.stringify(createErrorPayload(err)), { status: 500, headers });
          }

          return new Response(JSON.stringify({ success: true, ok: true, cascade: cascadeResults }), { status: 200, headers });
        } catch (error) {
          console.error("[Delete user] Unhandled", error);
          return new Response(JSON.stringify(createErrorPayload(error)), { status: 500, headers });
        }
      },
    },
  },
});
