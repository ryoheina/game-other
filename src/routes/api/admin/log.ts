import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/log")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const id = crypto.randomUUID();
          
          const { data, error } = await supabaseAdmin
            .from("downloads")
            .insert({
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
            })
            .select()
            .single();
          
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
