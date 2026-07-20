import { createFileRoute } from "@tanstack/react-router";

// In-memory store (same as in log.ts)
const logs: Record<string, any> = {};

export const Route = createFileRoute("/api/admin/logs")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const logsArray = Object.values(logs);
          console.log('[ADMIN API] Returning all logs:', logsArray.length);
          return new Response(JSON.stringify({ logs: logsArray }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error('[ADMIN API] GET error:', error);
          return new Response(JSON.stringify({ error: 'Failed to fetch logs' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      },
    },
  },
});
