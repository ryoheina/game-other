import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getClientMeta } from "./ua";
import { resolveCountry } from "./geo";
import { insertAdminNotification } from "./notifications";

type VisitPayload = {
  sessionId: string;
  path: string;
  heartbeat?: boolean;
  leaving?: boolean;
};

const VISITOR_RETURN_WINDOW_MS = 30 * 60 * 1000;

function getHeaderValue(headers: Headers | null, names: string[]) {
  if (!headers) return null;
  for (const name of names) {
    const value = headers.get(name);
    if (value) return value;
  }
  return null;
}

function getNetworkMeta(request: Request | null, country: string | null) {
  const headers = request?.headers ?? null;
  const ipCountry = getHeaderValue(headers, ["x-vercel-ip-country", "cf-ipcountry"]) || country;
  const ipCity = getHeaderValue(headers, ["x-vercel-ip-city", "cf-ipcity"]);
  const asn = getHeaderValue(headers, ["x-vercel-ip-as-number", "cf-asn"]);
  const isp = getHeaderValue(headers, ["x-vercel-ip-as-name", "cf-isp"]);

  return {
    ip_country: ipCountry,
    ip_city: ipCity ? decodeURIComponent(ipCity) : null,
    asn,
    isp,
  };
}

export async function recordVisit(request: Request | null, data: VisitPayload) {
  const meta = request ? getClientMeta(request) : { ip: null, country: null, ua: "", referrer: null, browser: "Unknown", os: "Unknown", device: "Desktop" };
  const country = meta.country ?? (request ? await resolveCountry(request.headers, meta.ip) : null);
  const networkMeta = getNetworkMeta(request, country);
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const now = new Date().toISOString();

  const { data: existing } = await supabaseAdmin
    .from("sessions")
    .select("session_id,last_active,notified_left")
    .eq("session_id", data.sessionId)
    .maybeSingle();
  if (existing) {
    if (data.leaving) {
      const leaveUpdate = {
        last_active: now,
        ip: meta.ip,
        country,
        browser: meta.browser,
        device: meta.device,
        user_agent: meta.ua,
        notified_left: true,
        ...networkMeta,
      };
      let leaveUpdateRes = await supabaseAdmin
        .from("sessions")
        .update(leaveUpdate)
        .eq("session_id", data.sessionId);
      if (leaveUpdateRes.error && /ip_country|ip_city|asn|isp|schema cache|column .* does not exist|Could not find .* column/i.test(leaveUpdateRes.error.message)) {
        const { ip_country: _ipCountry, ip_city: _ipCity, asn: _asn, isp: _isp, ...fallbackLeaveUpdate } = leaveUpdate;
        leaveUpdateRes = await supabaseAdmin
          .from("sessions")
          .update(fallbackLeaveUpdate)
          .eq("session_id", data.sessionId);
      }
      if (leaveUpdateRes.error) throw leaveUpdateRes.error;

      if (existing.notified_left !== true) {
        try {
          await insertAdminNotification(supabaseAdmin, {
            type: "visitor_left",
            type_detail: "visitor",
            title: "Visitor Left",
            body: `${meta.ip ?? "unknown"} - ${country ?? "unknown"} - ${meta.device} - ${meta.browser}`,
            session_id: data.sessionId,
            ip_address: meta.ip,
            country,
            browser: meta.browser,
            device: meta.device,
            payload: { session_id: data.sessionId, ip_address: meta.ip, country, browser: meta.browser, device: meta.device },
            read: false,
            delivered: false,
          });
        } catch (e) {
          console.error("notify failed", e);
        }
      }

      return { ok: true };
    }

    const wasOffline = Date.now() - new Date(existing.last_active as string).getTime() > VISITOR_RETURN_WINDOW_MS;
    const sessionUpdate = {
      last_active: now,
      ip: meta.ip,
      country,
      browser: meta.browser,
      device: meta.device,
      user_agent: meta.ua,
      notified_left: false,
      ...networkMeta,
    };
    let sessionUpdateRes = await supabaseAdmin
      .from("sessions")
      .update(sessionUpdate)
      .eq("session_id", data.sessionId);
    if (sessionUpdateRes.error && /ip_country|ip_city|asn|isp|schema cache|column .* does not exist|Could not find .* column/i.test(sessionUpdateRes.error.message)) {
      const { ip_country: _ipCountry, ip_city: _ipCity, asn: _asn, isp: _isp, ...fallbackUpdate } = sessionUpdate;
      sessionUpdateRes = await supabaseAdmin
        .from("sessions")
        .update(fallbackUpdate)
        .eq("session_id", data.sessionId);
    }
    if (sessionUpdateRes.error) throw sessionUpdateRes.error;
    if (data.heartbeat) return { ok: true };
    if (wasOffline || existing.notified_left === true) {
      try {
        await insertAdminNotification(supabaseAdmin, {
          type: "visitor",
          type_detail: "visitor",
          title: "Visitor Arrived",
          body: `${meta.ip ?? "unknown"} - ${country ?? "unknown"} - ${meta.device} - ${meta.browser}`,
          session_id: data.sessionId,
          ip_address: meta.ip,
          country,
          browser: meta.browser,
          device: meta.device,
          payload: {
            type_detail: "visitor",
            session_id: data.sessionId,
            ip_address: meta.ip,
            country,
            browser: meta.browser,
            device: meta.device,
          },
          read: false,
          delivered: false,
        });
      } catch (e) {
        console.error("notify failed", e);
      }
    }
  } else if (data.heartbeat) {
    return { ok: true };
  }

  const visitRecord = {
    session_id: data.sessionId,
    path: data.path,
    ip: meta.ip,
    country,
    ...networkMeta,
    browser: meta.browser,
    os: meta.os,
    device: meta.device,
    user_agent: meta.ua,
    referrer: meta.referrer,
  };
  let visitInsertRes = await supabaseAdmin.from("visits").insert(visitRecord);
  if (visitInsertRes.error && /ip_country|ip_city|asn|isp|schema cache|column .* does not exist|Could not find .* column/i.test(visitInsertRes.error.message)) {
    const { ip_country: _ipCountry, ip_city: _ipCity, asn: _asn, isp: _isp, ...fallbackVisitRecord } = visitRecord;
    visitInsertRes = await supabaseAdmin.from("visits").insert(fallbackVisitRecord);
  }
  if (visitInsertRes.error) throw visitInsertRes.error;

  if (!existing) {
    const sessionRecord = {
      session_id: data.sessionId,
      ip: meta.ip,
      country,
      ...networkMeta,
      browser: meta.browser,
      device: meta.device,
      user_agent: meta.ua,
      first_visit: now,
      last_active: now,
    };
    let sessionInsertRes = await supabaseAdmin
      .from("sessions")
      .insert(sessionRecord);
    if (sessionInsertRes.error && /ip_country|ip_city|asn|isp|schema cache|column .* does not exist|Could not find .* column/i.test(sessionInsertRes.error.message)) {
      const { ip_country: _ipCountry, ip_city: _ipCity, asn: _asn, isp: _isp, ...fallbackSessionRecord } = sessionRecord;
      sessionInsertRes = await supabaseAdmin.from("sessions").insert(fallbackSessionRecord);
    }
    if (sessionInsertRes.error) throw sessionInsertRes.error;

    try {
      await insertAdminNotification(supabaseAdmin, {
        type: "visitor",
        type_detail: "visitor",
        title: "Visitor Arrived",
        body: `${meta.ip ?? "unknown"} - ${country ?? "unknown"} - ${meta.device} - ${meta.browser}`,
        session_id: data.sessionId,
        ip_address: meta.ip,
        country,
        browser: meta.browser,
        device: meta.device,
        payload: {
          type_detail: "visitor",
          session_id: data.sessionId,
          ip_address: meta.ip,
          country,
          browser: meta.browser,
          device: meta.device,
        },
        read: false,
        delivered: false,
      });
    } catch (e) {
      console.error("notify failed", e);
    }
  }

  return { ok: true };
}

export const trackVisit = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        sessionId: z.string().min(8).max(64),
        path: z.string().max(500),
        heartbeat: z.boolean().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const req = getRequest();
    return recordVisit(req, data);
  });

export const submitContact = createServerFn({ method: "POST" })
  .validator((d) =>
    z
      .object({
        name: z.string().trim().min(1).max(120),
        email: z.string().trim().email().max(200),
        message: z.string().trim().min(1).max(5000),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("contact_messages").insert(data);
    if (error) throw new Error("Could not save your message");
    return { ok: true };
  });

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roleRow, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      throw new Error("Unable to verify admin status");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existingAdmin, error: existingAdminError } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (existingAdminError) {
      throw new Error("Unable to verify admin roles");
    }

    return {
      isAdmin: Boolean(roleRow),
      anyAdmin: (existingAdmin?.length ?? 0) > 0,
    };
  });

export const promoteToAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: existingAdmin, error: existingAdminError } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("role", "admin")
      .limit(1);

    if (existingAdminError) {
      throw new Error("Unable to verify admin roles");
    }

    if ((existingAdmin?.length ?? 0) > 0) {
      return { ok: false, alreadyExists: true };
    }

    const { error } = await supabaseAdmin.from("user_roles").insert({
      user_id: context.userId,
      role: "admin",
    });

    if (error) {
      throw new Error("Unable to promote this account to admin");
    }

    return { ok: true };
  });

export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roleRow, error } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error || !roleRow) {
      throw new Error("Forbidden");
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
      byCountry,
      byBrowser,
      byOs,
      traffic24h,
      messages,
    ] = await Promise.all([
      supabaseAdmin.from("visits").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("visits").select("*", { count: "exact", head: true }).gte("created_at", sinceToday),
      supabaseAdmin.from("visits").select("session_id", { count: "exact" }).gte("created_at", since5m),
      supabaseAdmin.from("downloads").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("visits").select("*").order("created_at", { ascending: false }).limit(15),
      supabaseAdmin.from("downloads").select("*").order("created_at", { ascending: false }).limit(15),
      supabaseAdmin.from("visits").select("country").gte("created_at", since24h),
      supabaseAdmin.from("visits").select("browser").gte("created_at", since24h),
      supabaseAdmin.from("visits").select("os").gte("created_at", since24h),
      supabaseAdmin.from("visits").select("created_at").gte("created_at", since24h),
      supabaseAdmin.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(10),
    ]);

    const tally = (rows: { [k: string]: string | null }[] | null | undefined, key: string) => {
      const m: Record<string, number> = {};
      (rows || []).forEach((r) => {
        const v = (r[key] as string) || "Unknown";
        m[v] = (m[v] || 0) + 1;
      });
      return Object.entries(m)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value }));
    };

    const hourly = new Array(24).fill(0).map((_, i) => ({ hour: i, visits: 0 }));
    (traffic24h.data || []).forEach((r) => {
      const h = new Date(r.created_at as string).getHours();
      hourly[h].visits++;
    });

    const uniqueOnline = new Set((onlineNow.data || []).map((r) => r.session_id)).size;

    return {
      totals: {
        visits: visitsTotal.count || 0,
        today: visitsToday.count || 0,
        online: uniqueOnline,
        downloads: downloadsTotal.count || 0,
      },
      recentVisits: recentVisits.data || [],
      recentDownloads: recentDownloads.data || [],
      byCountry: tally(byCountry.data, "country"),
      byBrowser: tally(byBrowser.data, "browser"),
      byOs: tally(byOs.data, "os"),
      hourly,
      messages: messages.data || [],
    };
  });
