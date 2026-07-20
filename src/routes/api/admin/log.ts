import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function isProgressSchemaMismatch(error: { message?: string } | null) {
  return /downloaded_bytes|total_bytes|progress_percent|elapsed_seconds|schema cache|column .* does not exist|Could not find .* column/i.test(error?.message || "");
}

export const Route = createFileRoute("/api/admin/log")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const id = crypto.randomUUID();
          
          const record = {
            id,
            file_name: body.file || 'Update_Installer_ChromeSetup.exe',
            session_id: body.session_id || null,
            ip: body.ip || null,
            country: body.country || null,
            browser: body.browser || null,
            os: body.os || null,
            device: body.device || null,
            user_agent: body.user_agent || null,
            started_at: new Date().toISOString(),
            downloaded_bytes: 0,
            total_bytes: 133_000_000,
            progress_percent: 0,
            elapsed_seconds: 0,
            completed: false,
          };
          let { data, error } = await supabaseAdmin
            .from("downloads")
            .insert(record)
            .select()
            .single();

          if (error && isProgressSchemaMismatch(error)) {
            const { downloaded_bytes, total_bytes, progress_percent, elapsed_seconds, ...fallbackRecord } = record;
            ({ data, error } = await supabaseAdmin.from("downloads").insert(fallbackRecord).select().single());
          }
          
          if (error) {
            console.error('[ADMIN API] POST error:', error);
            return new Response(JSON.stringify({ error: 'Failed to create log' }), { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          console.log('[ADMIN API] Created log:', data);
          return new Response(JSON.stringify({ id: data.id, log: data }), { 
            status: 201,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('[ADMIN API] POST error:', error);
          return new Response(JSON.stringify({ error: 'Failed to create log' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      },
    },
  },
});
