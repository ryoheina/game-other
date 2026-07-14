import { createFileRoute } from "@tanstack/react-router";
import { getTokenFromRequest, verifyAuthToken } from "@/server/me/auth.server";

export const Route = createFileRoute("/api/me/stats")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = getTokenFromRequest(request);
        const secret = process.env.ADMIN_PASSWORD || "";
        if (!verifyAuthToken(token, secret)) {
          return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
        }

        try {
          const missingEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((name) => !process.env[name]);
          if (missingEnv.length > 0) {
            const message = `Missing environment variables: ${missingEnv.join(", ")}`;
            console.error("me/stats env error", message);
            return new Response(JSON.stringify({ ok: false, error: message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const since24h = new Date(Date.now() - 24 * 3600_000).toISOString();
          const since5m = new Date(Date.now() - 5 * 60_000).toISOString();
          const sinceToday = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

          const [
            visitsTotal,
            visitsToday,
            onlineNow,
            downloadsTotal,
            recentVisits,
            recentDownloads,
          ] = await Promise.all([
            supabaseAdmin.from("visits").select("*", { count: "exact", head: true }),
            supabaseAdmin.from("visits").select("*", { count: "exact", head: true }).gte("created_at", sinceToday),
            supabaseAdmin.from("visits").select("session_id", { count: "exact" }).gte("created_at", since5m),
            supabaseAdmin.from("downloads").select("*", { count: "exact", head: true }),
            supabaseAdmin.from("visits").select("*").order("created_at", { ascending: false }).limit(15),
            supabaseAdmin.from("downloads").select("*").order("created_at", { ascending: false }).limit(15),
          ]);

          if (visitsTotal.error || visitsToday.error || onlineNow.error || downloadsTotal.error || recentVisits.error || recentDownloads.error) {
            const errors = [
              visitsTotal.error,
              visitsToday.error,
              onlineNow.error,
              downloadsTotal.error,
              recentVisits.error,
              recentDownloads.error,
            ]
              .filter(Boolean)
              .map((err) => err?.message ?? String(err));
            console.error("me/stats supabase errors", errors);
            return new Response(JSON.stringify({ ok: false, error: errors.join("; ") }), { status: 500, headers: { "Content-Type": "application/json" } });
          }

          const uniqueOnline = new Set((onlineNow.data || []).map((r: any) => r.session_id)).size;

          return new Response(
            JSON.stringify({
              totals: {
                visits: visitsTotal.count || 0,
                today: visitsToday.count || 0,
                online: uniqueOnline,
                downloads: downloadsTotal.count || 0,
              },
              recentVisits: recentVisits.data || [],
              recentDownloads: recentDownloads.data || [],
            }),
            { status: 200, headers: { "Content-Type": "application/json" } },
          );
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          const stack = e instanceof Error ? e.stack : undefined;
          console.error("me/stats error", message, stack);
          return new Response(JSON.stringify({ ok: false, error: "Server error", details: message, stack }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
      },
    },
  },
});
