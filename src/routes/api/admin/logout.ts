import { createFileRoute } from "@tanstack/react-router";
import { clearAdminAuthCookie } from "@/lib/admin-auth";

export const Route = createFileRoute("/api/admin/logout")({
  server: {
    handlers: {
      POST: async () => {
        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: {
            "content-type": "application/json",
            "set-cookie": clearAdminAuthCookie(),
          },
        });
      },
    },
  },
});
