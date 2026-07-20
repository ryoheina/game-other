import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/admin/log/$id")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        try {
          const { id } = params;
          const body = await request.json();
          
          const updateData: any = {};
          if (body.status === 'complete') {
            updateData.completed = true;
            updateData.completed_at = new Date().toISOString();
            updateData.progress_percent = 100;
            updateData.downloaded_bytes = 133_000_000;
          }
          if (body.status === 'failed') {
            updateData.completed = false;
          }
          
          const { data, error } = await supabaseAdmin
            .from("downloads")
            .update(updateData)
            .eq("id", id)
            .select()
            .single();
          
          if (error) {
            console.error('[ADMIN API] PUT error:', error);
            return new Response(JSON.stringify({ error: 'Failed to update log' }), { 
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          console.log('[ADMIN API] Updated log:', data);
          return new Response(JSON.stringify({ id: data.id, log: data }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('[ADMIN API] PUT error:', error);
          return new Response(JSON.stringify({ error: 'Failed to update log' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      },
    },
  },
});
