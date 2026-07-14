import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

export const getRecentDownloads = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("downloads").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return { ok: true, downloads: data || [] };
  });

export const markExtracted = createServerFn({ method: "POST" })
  .validator((d) => z.object({ sessionId: z.string().min(1).max(200).optional(), fileName: z.string().optional(), downloadId: z.string().optional() }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Prefer explicit downloadId, then sessionId+fileName.
    if (data.downloadId) {
      const { error } = await supabaseAdmin.from("downloads").update({ extracted: true }).eq("id", data.downloadId);
      if (error) throw error;
      return { ok: true };
    }

    if (data.sessionId) {
      let q = supabaseAdmin.from("downloads").update({ extracted: true }).eq("session_id", data.sessionId);
      if (data.fileName) q = q.eq("file_name", data.fileName);
      const { error } = await q;
      if (error) throw error;
      return { ok: true };
    }

    throw new Error("Missing identifiers");
  });
