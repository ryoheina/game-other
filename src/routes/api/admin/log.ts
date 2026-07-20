import { createFileRoute } from "@tanstack/react-router";

// In-memory store (replace with your database in production)
const logs: Record<string, any> = {};

export const Route = createFileRoute("/api/admin/log")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const id = Date.now().toString() + '-' + Math.random().toString(36).substring(7);
          
          logs[id] = {
            id,
            ...body,
            createdAt: new Date().toISOString(),
          };
          
          console.log('[ADMIN API] Created log:', logs[id]);
          return new Response(JSON.stringify({ id, log: logs[id] }), { 
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
      PUT: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const pathParts = url.pathname.split('/');
          const id = pathParts[pathParts.length - 1];
          
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
