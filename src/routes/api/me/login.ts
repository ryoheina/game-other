import { createFileRoute } from "@tanstack/react-router";
import { createAuthToken, buildSetCookie } from "@/server/me/auth.server";

export const Route = createFileRoute("/api/me/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(() => ({} as Record<string, unknown>));
        const password = typeof body.password === "string" ? body.password : null;
        const adminPassword = process.env.ADMIN_PASSWORD || process.env.STUDIO_ADMIN_PASSWORD || null;
        if (!adminPassword) {
          return new Response(JSON.stringify({ ok: false, error: "ADMIN_PASSWORD not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
        if (!password || password !== adminPassword) {
          return new Response(JSON.stringify({ ok: false, error: "Invalid credentials" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        const token = createAuthToken(adminPassword);
        const setCookie = buildSetCookie(token);
        return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json", "Set-Cookie": setCookie } });
      },
    },
  },
});
