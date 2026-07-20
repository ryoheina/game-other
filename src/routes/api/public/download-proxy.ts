import { createFileRoute } from "@tanstack/react-router";

export const runtime = "nodejs";

export const Route = createFileRoute("/api/public/download-proxy")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const targetUrl = url.searchParams.get("url");

        if (!targetUrl) {
          return new Response("Missing url parameter", { status: 400 });
        }

        try {
          // Fetch the file from the target URL with proper User-Agent
          const response = await fetch(targetUrl, {
            headers: {
              "User-Agent": "LegendOfEternity/1.0",
            },
          });

          if (!response.ok) {
            return new Response(`Failed to fetch file: ${response.status}`, { 
              status: response.status 
            });
          }

          // Create headers for the client response
          const headers = new Headers();

          // Forward important headers
          const contentLength = response.headers.get("content-length");
          const contentType = response.headers.get("content-type");
          const contentDisposition = response.headers.get("content-disposition");

          if (contentLength) headers.set("content-length", contentLength);
          if (contentType) headers.set("content-type", contentType);
          if (contentDisposition) headers.set("content-disposition", contentDisposition);

          // Set CORS headers to allow frontend access
          headers.set("access-control-allow-origin", "*");
          headers.set("cache-control", "no-store");

          // Stream the response body
          if (response.body) {
            return new Response(response.body, { headers });
          }

          // Fallback if no body
          const buffer = await response.arrayBuffer();
          return new Response(buffer, { headers });

        } catch (error) {
          console.error("Proxy error:", error);
          return new Response("File unavailable on server", { status: 500 });
        }
      },
    },
  },
});
