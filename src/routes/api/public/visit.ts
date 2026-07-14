import { createFileRoute } from "@tanstack/react-router";
import { recordVisit } from "@/lib/analytics.functions";

export const runtime = "nodejs";

function isPublicVisitorPath(path: string) {
  try {
    const pathname = path.startsWith("http") ? new URL(path).pathname : path;
    return pathname === "/" || pathname === "/installed";
  } catch {
    return false;
  }
}

function hasAdminCookie(request: Request) {
  return /(?:^|;\s*)admin-auth-token=/.test(request.headers.get("cookie") || "");
}

export const Route = createFileRoute("/api/public/visit")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => null);
          const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
          const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";
          const heartbeat = body?.heartbeat === true;
          const leaving = body?.leaving === true;

          if (sessionId.length < 8 || sessionId.length > 64) {
            return new Response(JSON.stringify({ success: false, error: "Invalid session" }), {
              status: 400,
              headers: { "content-type": "application/json", "Cache-Control": "no-store" },
            });
          }

          if (hasAdminCookie(request) || !isPublicVisitorPath(path)) {
            return new Response(JSON.stringify({ success: true, skipped: true }), {
              status: 200,
              headers: { "content-type": "application/json", "Cache-Control": "no-store" },
            });
          }

          await recordVisit(request, { sessionId, path, heartbeat, leaving });
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "content-type": "application/json", "Cache-Control": "no-store" },
          });
        } catch (error) {
          console.error("[Visit] tracking failed", error);
          return new Response(JSON.stringify({ success: false }), {
            status: 500,
            headers: { "content-type": "application/json", "Cache-Control": "no-store" },
          });
        }
      },
    },
  },
});
