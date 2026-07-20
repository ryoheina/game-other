import { createFileRoute } from "@tanstack/react-router";

// In-memory store (replace with your database in production)
const logs: Record<string, any> = {};

export const Route = createFileRoute("/api/admin/log/$id")({
  server: {
    handlers: {
      PUT: async ({ request, params }) => {
        try {
          const { id } = params;
          
          if (!id || !logs[id]) {
            return new Response(JSON.stringify({ error: 'Log not found' }), { 
              status: 404,
              headers: { 'Content-Type': 'application/json' }
            });
          }
          
          const body = await request.json();
          logs[id] = { ...logs[id], ...body };
          
          console.log('[ADMIN API] Updated log:', logs[id]);
          return new Response(JSON.stringify({ id, log: logs[id] }), { 
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
