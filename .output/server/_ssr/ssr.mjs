//#region node_modules/.nitro/vite/services/ssr/index.js
var lastCapturedError;
var TTL_MS = 5e3;
function record(error) {
	lastCapturedError = {
		error,
		at: Date.now()
	};
}
if (typeof globalThis.addEventListener === "function") {
	globalThis.addEventListener("error", (event) => record(event.error ?? event));
	globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
function consumeLastCapturedError() {
	if (!lastCapturedError) return void 0;
	if (Date.now() - lastCapturedError.at > TTL_MS) {
		lastCapturedError = void 0;
		return;
	}
	const { error } = lastCapturedError;
	lastCapturedError = void 0;
	return error;
}
function renderErrorPage() {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
var serverEntryPromise;
async function getServerEntry() {
	if (!serverEntryPromise) serverEntryPromise = import("./server-BD7IRtML.mjs").then((m) => m.default ?? m);
	return serverEntryPromise;
}
async function normalizeCatastrophicSsrResponse(response) {
	if (response.status < 500) return response;
	if (!(response.headers.get("content-type") ?? "").includes("application/json")) return response;
	const body = await response.clone().text();
	if (!isH3SwallowedErrorBody(body)) return response;
	console.error(consumeLastCapturedError() ?? /* @__PURE__ */ new Error(`h3 swallowed SSR error: ${body}`));
	return new Response(renderErrorPage(), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
function isH3SwallowedErrorBody(body) {
	try {
		const payload = JSON.parse(body);
		return payload.unhandled === true && payload.message === "HTTPError";
	} catch {
		return false;
	}
}
function isSensitiveSourcePath(pathname) {
	const lower = decodeURIComponent(pathname).toLowerCase();
	return lower === "/.env" || lower === "/package.json" || lower === "/package-lock.json" || lower === "/bun.lock" || lower === "/vite.config.ts" || lower === "/tsconfig.json" || lower === "/wrangler-dev.log" || lower.startsWith("/.git") || lower.startsWith("/.vercel") || lower.startsWith("/.wrangler") || lower.startsWith("/node_modules") || lower.startsWith("/src/") || lower.startsWith("/supabase/") || lower.startsWith("/scripts/") || lower.endsWith(".map");
}
function secureResponse(response, request) {
	const headers = new Headers(response.headers);
	const url = new URL(request.url);
	const isAdminOrApi = url.pathname === "/admin" || url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin/");
	headers.set("X-Content-Type-Options", "nosniff");
	headers.set("X-Frame-Options", "DENY");
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), bluetooth=()");
	headers.set("Cross-Origin-Opener-Policy", "same-origin");
	headers.set("Cross-Origin-Resource-Policy", "same-origin");
	headers.set("Content-Security-Policy", [
		"default-src 'self'",
		"script-src 'self' 'unsafe-inline'",
		"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
		"font-src 'self' https://fonts.gstatic.com data:",
		"img-src 'self' data: blob: https:",
		"media-src 'self' blob:",
		"connect-src 'self' https:",
		"frame-ancestors 'none'",
		"base-uri 'self'",
		"form-action 'self'",
		"object-src 'none'"
	].join("; "));
	if (isAdminOrApi) {
		headers.set("Cache-Control", "no-store");
		headers.set("X-Robots-Tag", "noindex, nofollow");
	}
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	});
}
var server_default = { async fetch(request, env, ctx) {
	const url = new URL(request.url);
	const directDownloadPaths = ["/LegendsofEternity.exe", "/legendsofeternity.exe"];
	const isInternalDownloadFetch = request.headers.get("x-internal-download-fetch") === "1";
	if (isSensitiveSourcePath(url.pathname)) return secureResponse(new Response("Not found", { status: 404 }), request);
	if (directDownloadPaths.includes(url.pathname) && !isInternalDownloadFetch) return secureResponse(new Response("Direct file access is forbidden. Use the download endpoint.", { status: 403 }), request);
	try {
		return secureResponse(await normalizeCatastrophicSsrResponse(await (await getServerEntry()).fetch(request, env, ctx)), request);
	} catch (error) {
		console.error(error);
		return secureResponse(new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		}), request);
	}
} };
//#endregion
export { server_default as default, renderErrorPage as t };
