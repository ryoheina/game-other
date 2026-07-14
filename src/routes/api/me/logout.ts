import { createFileRoute } from "@tanstack/react-router";
import { buildClearCookie } from "@/server/me/auth.server";

export const Route = createFileRoute("/api/me/logout")({
  server: {
    handlers: {
      POST: async () => {
        const header = buildClearCookie();
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": header } });
      },
    },
  },
});
