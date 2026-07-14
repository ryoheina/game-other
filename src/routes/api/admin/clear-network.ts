import { createFileRoute } from "@tanstack/react-router";
import { isAdminAuthorized } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/admin/clear-network")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = { "content-type": "application/json" };
        try {
          if (!(await isAdminAuthorized(request))) {
            return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), { status: 401, headers });
          }
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("visits").delete().not("id", "is", null);
          if (error) throw error;
          return new Response(JSON.stringify({ success: true }), { status: 200, headers });
        } catch (error) {
          console.error("[Clear network]", error);
          return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }), { status: 500, headers });
        }
      },
    },
  },
});
