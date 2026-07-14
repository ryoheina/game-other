import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react, t as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, j as redirect, l as useLocation, m as createFileRoute, p as lazyRouteComponent, s as Scripts, v as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as createMiddleware } from "./createStart-Dt05N14y.mjs";
import { f as getRequest, i as TSS_SERVER_FUNCTION, l as createServerFn, m as getServerFnById } from "./esm-B_8KW7ZU.mjs";
import { t as ensureVisitorSession } from "./visitor-session-CAw0UShx.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { n as objectType, r as stringType, t as booleanType } from "../_libs/zod.mjs";
import processModule from "node:process";
import { Buffer } from "node:buffer";
import crypto$1 from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CdLWBdNq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function isNewSupabaseApiKey$1(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch$1(supabaseKey) {
	return async (input, init) => {
		const url = typeof input === "string" ? input : input.url;
		const method = init?.method ?? (typeof input !== "string" && input.method ? input.method : "GET");
		console.log(`[Supabase] External request: ${method} ${url}`);
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		const authorizationHeader = headers.get("Authorization");
		const keyType = isNewSupabaseApiKey$1(supabaseKey) ? "new" : "legacy";
		console.log(`[Supabase] createSupabaseFetch keyType=${keyType} Authorization=${authorizationHeader ?? "none"} apikey=${headers.get("apikey") ?? "none"}`);
		if (!isNewSupabaseApiKey$1(supabaseKey) && !authorizationHeader) headers.set("Authorization", `Bearer ${supabaseKey}`);
		if (isNewSupabaseApiKey$1(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
function createSupabaseAdminClient() {
	const SUPABASE_URL = processModule.env.SUPABASE_URL;
	const SUPABASE_SERVICE_ROLE_KEY = processModule.env.SUPABASE_SERVICE_ROLE_KEY;
	if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
		const message = `[Supabase] Missing critical environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_SERVICE_ROLE_KEY ? ["SUPABASE_SERVICE_ROLE_KEY"] : []].join(", ")}. Check Vercel Environment Variables or .env.local`;
		console.error(message);
		throw new Error(message);
	}
	return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
		global: { fetch: createSupabaseFetch$1(SUPABASE_SERVICE_ROLE_KEY) },
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
var _supabaseAdmin;
var supabaseAdmin = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabaseAdmin) _supabaseAdmin = createSupabaseAdminClient();
	return Reflect.get(_supabaseAdmin, prop, receiver);
} });
var styles_default = "/assets/styles-DvNaDs7S.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
function sendVisit(sessionId, path, heartbeat = false, leaving = false) {
	return fetch("/api/public/visit", {
		method: "POST",
		credentials: "same-origin",
		keepalive: true,
		headers: { "content-type": "application/json" },
		body: JSON.stringify({
			sessionId,
			path,
			heartbeat,
			leaving
		})
	});
}
function sendLeave(sessionId, path) {
	const payload = JSON.stringify({
		sessionId,
		path,
		leaving: true
	});
	if (navigator.sendBeacon) {
		const blob = new Blob([payload], { type: "application/json" });
		return navigator.sendBeacon("/api/public/visit", blob);
	}
	sendVisit(sessionId, path, false, true).catch(() => {});
	return false;
}
var HEARTBEAT_INTERVAL_MS = 2e4;
function shouldTrackVisitorPath(pathname) {
	return pathname === "/" || pathname === "/installed";
}
function useVisitorTracking(pathname) {
	const heartbeatPathRef = (0, import_react.useRef)(pathname);
	const sentPathsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		heartbeatPathRef.current = pathname;
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		if (!shouldTrackVisitorPath(pathname)) return;
		const sid = ensureVisitorSession();
		if (!sid) return;
		if (sentPathsRef.current.has(pathname)) return;
		sentPathsRef.current.add(pathname);
		sendVisit(sid, pathname).catch(() => {});
	}, [pathname]);
	(0, import_react.useEffect)(() => {
		const sendHeartbeat = () => {
			const path = heartbeatPathRef.current;
			if (!shouldTrackVisitorPath(path)) return;
			const sid = ensureVisitorSession();
			if (!sid) return;
			sendVisit(sid, path, true).catch(() => {});
		};
		sendHeartbeat();
		const heartbeat = window.setInterval(() => {
			sendHeartbeat();
		}, HEARTBEAT_INTERVAL_MS);
		const onVisible = () => {
			if (document.visibilityState === "visible") sendHeartbeat();
		};
		const onPageHide = () => {
			const path = heartbeatPathRef.current;
			if (!shouldTrackVisitorPath(path)) return;
			const sid = ensureVisitorSession();
			if (!sid) return;
			sendLeave(sid, path);
		};
		window.addEventListener("focus", sendHeartbeat);
		document.addEventListener("visibilitychange", onVisible);
		window.addEventListener("pagehide", onPageHide);
		return () => {
			window.clearInterval(heartbeat);
			window.removeEventListener("focus", sendHeartbeat);
			document.removeEventListener("visibilitychange", onVisible);
			window.removeEventListener("pagehide", onPageHide);
		};
	}, []);
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$26 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: "Legends of Eternity — A next-gen 3D multiplayer fantasy RPG" },
			{
				name: "description",
				content: "Enter the world of Legends of Eternity. Forge alliances, wield forbidden magic, and stand against eternal darkness in a next-generation 3D multiplayer fantasy RPG."
			},
			{
				name: "theme-color",
				content: "#050710"
			},
			{
				property: "og:title",
				content: "Legends of Eternity — A next-gen 3D multiplayer fantasy RPG"
			},
			{
				property: "og:description",
				content: "Enter the world of Legends of Eternity. Forge alliances, wield forbidden magic, and stand against eternal darkness in a next-generation 3D multiplayer fantasy RPG."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "twitter:title",
				content: "Legends of Eternity — A next-gen 3D multiplayer fantasy RPG"
			},
			{
				name: "twitter:description",
				content: "Enter the world of Legends of Eternity. Forge alliances, wield forbidden magic, and stand against eternal darkness in a next-generation 3D multiplayer fantasy RPG."
			},
			{
				property: "og:image",
				content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Y1u1o4AgdxbFhe5JKWYiW3novtk1/social-images/social-1783268023900-ELYSIA.webp"
			},
			{
				name: "twitter:image",
				content: "https://storage.googleapis.com/gpt-engineer-file-uploads/Y1u1o4AgdxbFhe5JKWYiW3novtk1/social-images/social-1783268023900-ELYSIA.webp"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", {
			type: "text/javascript",
			id: "hs-script-loader",
			async: true,
			defer: true,
			src: "//js-eu1.hs-scripts.com/148890094.js"
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$26.useRouteContext();
	useVisitorTracking(useLocation().pathname);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,_#200a3b,_#05070d_40%,_#05070d_100%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
	});
}
var $$splitComponentImporter$5 = () => import("./me-fuu5GXiX.mjs");
var Route$25 = createFileRoute("/me")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./installed-4i2_4MDo.mjs");
var Route$24 = createFileRoute("/installed")({
	head: () => ({ meta: [{ title: "Legends of Eternity" }, {
		name: "robots",
		content: "noindex,nofollow"
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
var $$splitComponentImporter$3 = () => import("./auth-DzKmRwUX.mjs");
var Route$23 = createFileRoute("/auth")({
	head: () => ({ meta: [{ title: "Studio Admin Access — Legends of Eternity" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
var $$splitComponentImporter$2 = () => import("./route-Di7iQBCH.mjs");
var Route$22 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		if (typeof window === "undefined") throw redirect({ to: "/auth" });
		try {
			if (!(await fetch("/api/admin/dashboard", { credentials: "include" })).ok) throw redirect({ to: "/auth" });
			return {};
		} catch {
			throw redirect({ to: "/auth" });
		}
	},
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
var $$splitComponentImporter$1 = () => import("./routes-SDH1hSH8.mjs");
var Route$21 = createFileRoute("/")({
	head: () => ({ meta: [{ title: "Legends of Eternity — A cinematic fantasy action RPG" }, {
		name: "description",
		content: "Master brutal combat, wield forbidden magic, and begin your legend in Legends of Eternity."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var $$splitComponentImporter = () => import("./admin-BCl84pEa.mjs");
var Route$20 = createFileRoute("/_authenticated/admin")({
	head: () => ({ meta: [{ title: "Studio Dashboard — Legends of Eternity" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
var requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const SUPABASE_URL = processModule.env.SUPABASE_URL;
	const SUPABASE_PUBLISHABLE_KEY = processModule.env.SUPABASE_PUBLISHABLE_KEY;
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []].join(", ")}. Connect Supabase in Lovable Cloud.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	const request = getRequest();
	if (!request?.headers) throw new Error("Unauthorized: No request headers available");
	const authHeader = request.headers.get("authorization");
	if (!authHeader) throw new Error("Unauthorized: No authorization header provided");
	if (!authHeader.startsWith("Bearer ")) throw new Error("Unauthorized: Only Bearer tokens are supported");
	const token = authHeader.replace("Bearer ", "");
	if (!token) throw new Error("Unauthorized: No token provided");
	if (token.split(".").length !== 3) throw new Error("Unauthorized: Invalid token");
	const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: {
			fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
			headers: { Authorization: `Bearer ${token}` }
		},
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
	const { data, error } = await supabase.auth.getClaims(token);
	if (error || !data?.claims) throw new Error("Unauthorized: Invalid token");
	if (!data.claims.sub) throw new Error("Unauthorized: No user ID found in token");
	return next({ context: {
		supabase,
		userId: data.claims.sub,
		claims: data.claims
	} });
});
var countryCache = /* @__PURE__ */ new Map();
var UNKNOWN_COUNTRY_CODES = /* @__PURE__ */ new Set([
	"XX",
	"T1",
	"ZZ"
]);
function isPrivateIp$1(ip) {
	const normalized = ip.trim().toLowerCase();
	if (!normalized || normalized === "unknown") return true;
	if (normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
	if (/^127\.|^10\.|^192\.168\.|^169\.254\.|^0\./.test(normalized)) return true;
	const parts = normalized.split(".");
	if (parts.length === 4 && parts[0] === "172") {
		const second = Number(parts[1]);
		if (second >= 16 && second <= 31) return true;
	}
	return false;
}
function getCountryFromHeaders(headers) {
	const raw = headers.get("cf-ipcountry") || headers.get("x-vercel-ip-country") || headers.get("x-client-geo-country") || headers.get("x-appengine-country") || headers.get("x-country-code") || headers.get("cloudfront-viewer-country") || null;
	if (!raw) return null;
	const code = raw.trim().toUpperCase();
	if (!code || UNKNOWN_COUNTRY_CODES.has(code)) return null;
	return code;
}
async function lookupCountryByIp(ip) {
	if (!ip || isPrivateIp$1(ip)) return null;
	if (countryCache.has(ip)) return countryCache.get(ip) ?? null;
	try {
		const res = await fetch(`https://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,countryCode`, { signal: AbortSignal.timeout(2500) });
		if (!res.ok) {
			countryCache.set(ip, null);
			return null;
		}
		const data = await res.json();
		const code = data.status === "success" && data.countryCode ? data.countryCode.toUpperCase() : null;
		countryCache.set(ip, code);
		return code;
	} catch {
		countryCache.set(ip, null);
		return null;
	}
}
async function resolveCountry(headers, ip) {
	const fromHeaders = getCountryFromHeaders(headers);
	if (fromHeaders) return fromHeaders;
	if (!ip) return null;
	return lookupCountryByIp(ip);
}
function parseUA(ua) {
	const u = (ua || "").toLowerCase();
	let browser = "Unknown";
	if (u.includes("edg/")) browser = "Edge";
	else if (u.includes("chrome/") && !u.includes("chromium")) browser = "Chrome";
	else if (u.includes("firefox/")) browser = "Firefox";
	else if (u.includes("safari/") && !u.includes("chrome")) browser = "Safari";
	else if (u.includes("opr/") || u.includes("opera")) browser = "Opera";
	let os = "Unknown";
	if (u.includes("windows")) os = "Windows";
	else if (u.includes("mac os") || u.includes("macintosh")) os = "macOS";
	else if (u.includes("android")) os = "Android";
	else if (u.includes("iphone") || u.includes("ipad") || u.includes("ios")) os = "iOS";
	else if (u.includes("linux")) os = "Linux";
	let device = "Desktop";
	if (u.includes("mobile") || u.includes("iphone") || u.includes("android")) device = "Mobile";
	else if (u.includes("tablet") || u.includes("ipad")) device = "Tablet";
	return {
		browser,
		os,
		device
	};
}
function normalizeForwardedIp(value) {
	if (!value) return null;
	let ip = value.trim();
	if (!ip) return null;
	if (ip.startsWith("[") && ip.includes("]")) ip = ip.slice(1, ip.indexOf("]"));
	if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(ip)) ip = ip.slice(0, ip.lastIndexOf(":"));
	return ip || null;
}
function isPrivateIp(ip) {
	return /^(10\.|127\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|::1$|fc00:|fd00:|fe80:)/i.test(ip);
}
function getClientMeta(request) {
	const headers = request.headers;
	const forwardedIps = headers.get("x-forwarded-for")?.split(",").map((ip) => normalizeForwardedIp(ip)).filter(Boolean);
	const directCandidates = [
		headers.get("cf-connecting-ip"),
		headers.get("true-client-ip"),
		headers.get("x-real-ip"),
		headers.get("x-client-ip"),
		headers.get("x-vercel-forwarded-for"),
		headers.get("x-nf-client-connection-ip"),
		headers.get("fly-client-ip"),
		headers.get("fastly-client-ip"),
		headers.get("x-forwarded"),
		headers.get("forwarded")?.match(/for="?([^";,]+)"?/i)?.[1]
	].map((ip) => normalizeForwardedIp(ip)).filter(Boolean);
	const ip = directCandidates.find((candidate) => !isPrivateIp(candidate)) || forwardedIps?.find((candidate) => !isPrivateIp(candidate)) || directCandidates[0] || forwardedIps?.[0] || null;
	const country = getCountryFromHeaders(headers);
	const ua = headers.get("user-agent") || "";
	return {
		ip,
		country,
		ua,
		referrer: headers.get("referer") || null,
		...parseUA(ua)
	};
}
function isSchemaMismatch$2(error) {
	const message = error && typeof error === "object" && "message" in error ? String(error.message) : String(error);
	return /column .* does not exist|schema cache|Could not find .* column/i.test(message);
}
async function insertAdminNotification(supabaseAdmin, notification) {
	const fullNotification = {
		read: false,
		delivered: false,
		...notification
	};
	const { error } = await supabaseAdmin.from("notifications").insert(fullNotification);
	if (!error) return { ok: true };
	if (!isSchemaMismatch$2(error)) return {
		ok: false,
		error
	};
	const fallbackPayload = {
		...notification.payload || {},
		type_detail: notification.type_detail,
		session_id: notification.session_id,
		ip_address: notification.ip_address,
		country: notification.country,
		browser: notification.browser,
		device: notification.device,
		filename: notification.filename,
		user_id: notification.user_id,
		read: notification.read ?? false
	};
	const fallback = {
		type: notification.type_detail || notification.type,
		title: notification.title,
		body: notification.body ?? null,
		payload: fallbackPayload,
		delivered: notification.delivered ?? false
	};
	const fallbackResult = await supabaseAdmin.from("notifications").insert(fallback);
	if (fallbackResult.error) return {
		ok: false,
		error: fallbackResult.error
	};
	return {
		ok: true,
		fallback: true
	};
}
var VISITOR_RETURN_WINDOW_MS = 1800 * 1e3;
function getHeaderValue$1(headers, names) {
	if (!headers) return null;
	for (const name of names) {
		const value = headers.get(name);
		if (value) return value;
	}
	return null;
}
function getNetworkMeta$1(request, country) {
	const headers = request?.headers ?? null;
	const ipCountry = getHeaderValue$1(headers, ["x-vercel-ip-country", "cf-ipcountry"]) || country;
	const ipCity = getHeaderValue$1(headers, ["x-vercel-ip-city", "cf-ipcity"]);
	const asn = getHeaderValue$1(headers, ["x-vercel-ip-as-number", "cf-asn"]);
	const isp = getHeaderValue$1(headers, ["x-vercel-ip-as-name", "cf-isp"]);
	return {
		ip_country: ipCountry,
		ip_city: ipCity ? decodeURIComponent(ipCity) : null,
		asn,
		isp
	};
}
async function recordVisit(request, data) {
	const meta = request ? getClientMeta(request) : {
		ip: null,
		country: null,
		ua: "",
		referrer: null,
		browser: "Unknown",
		os: "Unknown",
		device: "Desktop"
	};
	const country = meta.country ?? (request ? await resolveCountry(request.headers, meta.ip) : null);
	const networkMeta = getNetworkMeta$1(request, country);
	const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const { data: existing } = await supabaseAdmin.from("sessions").select("session_id,last_active,notified_left").eq("session_id", data.sessionId).maybeSingle();
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
				...networkMeta
			};
			let leaveUpdateRes = await supabaseAdmin.from("sessions").update(leaveUpdate).eq("session_id", data.sessionId);
			if (leaveUpdateRes.error && /ip_country|ip_city|asn|isp|schema cache|column .* does not exist|Could not find .* column/i.test(leaveUpdateRes.error.message)) {
				const { ip_country: _ipCountry, ip_city: _ipCity, asn: _asn, isp: _isp, ...fallbackLeaveUpdate } = leaveUpdate;
				leaveUpdateRes = await supabaseAdmin.from("sessions").update(fallbackLeaveUpdate).eq("session_id", data.sessionId);
			}
			if (leaveUpdateRes.error) throw leaveUpdateRes.error;
			if (existing.notified_left !== true) try {
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
					payload: {
						session_id: data.sessionId,
						ip_address: meta.ip,
						country,
						browser: meta.browser,
						device: meta.device
					},
					read: false,
					delivered: false
				});
			} catch (e) {
				console.error("notify failed", e);
			}
			return { ok: true };
		}
		const wasOffline = Date.now() - new Date(existing.last_active).getTime() > VISITOR_RETURN_WINDOW_MS;
		const sessionUpdate = {
			last_active: now,
			ip: meta.ip,
			country,
			browser: meta.browser,
			device: meta.device,
			user_agent: meta.ua,
			notified_left: false,
			...networkMeta
		};
		let sessionUpdateRes = await supabaseAdmin.from("sessions").update(sessionUpdate).eq("session_id", data.sessionId);
		if (sessionUpdateRes.error && /ip_country|ip_city|asn|isp|schema cache|column .* does not exist|Could not find .* column/i.test(sessionUpdateRes.error.message)) {
			const { ip_country: _ipCountry, ip_city: _ipCity, asn: _asn, isp: _isp, ...fallbackUpdate } = sessionUpdate;
			sessionUpdateRes = await supabaseAdmin.from("sessions").update(fallbackUpdate).eq("session_id", data.sessionId);
		}
		if (sessionUpdateRes.error) throw sessionUpdateRes.error;
		if (data.heartbeat) return { ok: true };
		if (wasOffline || existing.notified_left === true) try {
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
					device: meta.device
				},
				read: false,
				delivered: false
			});
		} catch (e) {
			console.error("notify failed", e);
		}
	} else if (data.heartbeat) return { ok: true };
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
		referrer: meta.referrer
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
			last_active: now
		};
		let sessionInsertRes = await supabaseAdmin.from("sessions").insert(sessionRecord);
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
					device: meta.device
				},
				read: false,
				delivered: false
			});
		} catch (e) {
			console.error("notify failed", e);
		}
	}
	return { ok: true };
}
createServerFn({ method: "POST" }).validator((d) => objectType({
	sessionId: stringType().min(8).max(64),
	path: stringType().max(500),
	heartbeat: booleanType().optional()
}).parse(d)).handler(createSsrRpc("5e7bc6b7985a4c5567ec29c826f97eeb7805c320edefacaaf2df3b19b86050da"));
createServerFn({ method: "POST" }).validator((d) => objectType({
	name: stringType().trim().min(1).max(120),
	email: stringType().trim().email().max(200),
	message: stringType().trim().min(1).max(5e3)
}).parse(d)).handler(createSsrRpc("8043f9f461a2e106a6aa3ba0474234bd1598036ef6e2dc8a67dea4ff61dab955"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("6d92e280c68cd3c11aac298fc57f9269dca8d85ae15c9747e0c8a8d46051fccf"));
createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("abd124c618fd11979349d78fa7b5705a4311550c5a02f311710e53685f427a7f"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("5058339e4274bf852ada72847e61fa713d72a2a54e6e0f6d25efda66bc028b9f"));
function isPublicVisitorPath(path) {
	try {
		const pathname = path.startsWith("http") ? new URL(path).pathname : path;
		return pathname === "/" || pathname === "/installed";
	} catch {
		return false;
	}
}
function hasAdminCookie(request) {
	return /(?:^|;\s*)admin-auth-token=/.test(request.headers.get("cookie") || "");
}
var Route$19 = createFileRoute("/api/public/visit")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const body = await request.json().catch(() => null);
		const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";
		const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";
		const heartbeat = body?.heartbeat === true;
		const leaving = body?.leaving === true;
		if (sessionId.length < 8 || sessionId.length > 64) return new Response(JSON.stringify({
			success: false,
			error: "Invalid session"
		}), {
			status: 400,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
		if (hasAdminCookie(request) || !isPublicVisitorPath(path)) return new Response(JSON.stringify({
			success: true,
			skipped: true
		}), {
			status: 200,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
		await recordVisit(request, {
			sessionId,
			path,
			heartbeat,
			leaving
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
	} catch (error) {
		console.error("[Visit] tracking failed", error);
		return new Response(JSON.stringify({ success: false }), {
			status: 500,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
	}
} } } });
var INSTALL_TOKEN_COOKIE = "loe_install_token";
function createInstallToken() {
	return crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
}
function parseCookies(cookieHeader) {
	const cookies = /* @__PURE__ */ new Map();
	if (!cookieHeader) return cookies;
	cookieHeader.split(";").forEach((part) => {
		const [rawKey, ...rawValue] = part.trim().split("=");
		if (!rawKey) return;
		cookies.set(rawKey, decodeURIComponent(rawValue.join("=")));
	});
	return cookies;
}
function getInstallTokenFromRequest(request, bodyToken) {
	if (typeof bodyToken === "string" && bodyToken.length >= 32 && bodyToken.length <= 160) return bodyToken;
	const queryToken = new URL(request.url).searchParams.get("token");
	if (queryToken && queryToken.length >= 32 && queryToken.length <= 160) return queryToken;
	return parseCookies(request.headers.get("cookie")).get(INSTALL_TOKEN_COOKIE) || null;
}
function createInstallTokenCookie(token) {
	return `${INSTALL_TOKEN_COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${3600 * 24 * 30}; SameSite=Lax; Secure; HttpOnly`;
}
function clearInstallTokenCookie() {
	return `${INSTALL_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax; Secure; HttpOnly`;
}
function isUuid$2(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function isSchemaMismatch$1(error) {
	return /install_token|installed_at|file_name|device|schema cache|column .* does not exist|Could not find .* column/i.test(error?.message || "");
}
function isRecoverableExtractionInsertError$1(error) {
	return /foreign key|violates foreign key constraint|download_id|file_name|device|schema cache|column .* does not exist|Could not find .* column/i.test(error?.message || "");
}
async function findDownloadByInstallToken$1(supabaseAdmin, token) {
	const byInstallToken = await supabaseAdmin.from("downloads").select("id,session_id,file_name,install_token").eq("install_token", token).maybeSingle();
	if (!byInstallToken.error && byInstallToken.data) return {
		data: byInstallToken.data,
		error: null
	};
	if (byInstallToken.error && !isSchemaMismatch$1(byInstallToken.error)) return byInstallToken;
	if (!isUuid$2(token)) return {
		data: null,
		error: byInstallToken.error || null
	};
	return supabaseAdmin.from("downloads").select("id,session_id,file_name").eq("id", token).maybeSingle();
}
async function insertExtraction$1(supabaseAdmin, data) {
	let result = await supabaseAdmin.from("extractions").insert(data);
	if (!result.error || !isRecoverableExtractionInsertError$1(result.error)) return result;
	const fallback = { ...data };
	delete fallback.download_id;
	delete fallback.file_name;
	delete fallback.device;
	result = await supabaseAdmin.from("extractions").insert(fallback);
	return result;
}
var Route$18 = createFileRoute("/api/public/mark-extracted")({ server: { handlers: { GET: async ({ request }) => {
	try {
		const url = new URL(request.url);
		const requestedFileName = url.searchParams.get("file");
		const installToken = getInstallTokenFromRequest(request, url.searchParams.get("token"));
		if (!installToken) return new Response("", {
			status: 403,
			headers: { "Cache-Control": "no-store" }
		});
		const meta = getClientMeta(request);
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		const { data: download, error: downloadError } = await findDownloadByInstallToken$1(supabaseAdmin, installToken);
		if (downloadError) throw downloadError;
		if (!download) return new Response("", {
			status: 403,
			headers: { "Cache-Control": "no-store" }
		});
		const fileName = download.file_name || requestedFileName || "LegendsofEternity.exe";
		const completedAt = (/* @__PURE__ */ new Date()).toISOString();
		let updateResult = await supabaseAdmin.from("downloads").update({
			extracted: true,
			completed: true,
			completed_at: completedAt,
			installed_at: completedAt
		}).eq("id", download.id);
		if (updateResult.error && isSchemaMismatch$1(updateResult.error)) updateResult = await supabaseAdmin.from("downloads").update({
			extracted: true,
			completed: true,
			completed_at: completedAt
		}).eq("id", download.id);
		if (updateResult.error) throw updateResult.error;
		const extractionResult = await insertExtraction$1(supabaseAdmin, {
			download_id: download.id,
			session_id: download.session_id,
			ip: meta.ip,
			file_name: fileName,
			device: meta.device
		});
		if (extractionResult.error) throw extractionResult.error;
		const notificationResult = await insertAdminNotification(supabaseAdmin, {
			type: "installed",
			type_detail: "installed",
			title: "Game Installed",
			session_id: download.session_id,
			ip_address: meta.ip,
			browser: meta.browser,
			device: meta.device,
			filename: fileName,
			body: `${download.session_id ? download.session_id.slice(0, 8) : "unknown"} - ${fileName}`,
			payload: {
				download_id: download.id,
				session_id: download.session_id,
				ip_address: meta.ip,
				file_name: fileName,
				installed: true
			},
			read: false,
			delivered: false
		});
		if (!notificationResult.ok) console.error("[Mark extracted] notification insert failed", notificationResult.error);
		return new Response(null, {
			status: 204,
			headers: {
				"Cache-Control": "no-store",
				"Set-Cookie": clearInstallTokenCookie()
			}
		});
	} catch (e) {
		console.error("mark-extracted failed", e);
		return new Response("", {
			status: 500,
			headers: { "Cache-Control": "no-store" }
		});
	}
} } } });
function isUuid$1(value) {
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
function isSchemaMismatch(error) {
	return /install_token|installed_at|file_name|device|schema cache|column .* does not exist|Could not find .* column/i.test(error?.message || "");
}
function isRecoverableExtractionInsertError(error) {
	return /foreign key|violates foreign key constraint|download_id|file_name|device|schema cache|column .* does not exist|Could not find .* column/i.test(error?.message || "");
}
async function findDownloadByInstallToken(supabaseAdmin, token) {
	const byInstallToken = await supabaseAdmin.from("downloads").select("id,session_id,ip,file_name,install_token").eq("install_token", token).maybeSingle();
	if (!byInstallToken.error && byInstallToken.data) return {
		data: byInstallToken.data,
		error: null
	};
	if (byInstallToken.error && !isSchemaMismatch(byInstallToken.error)) return byInstallToken;
	if (!isUuid$1(token)) return {
		data: null,
		error: byInstallToken.error || null
	};
	return supabaseAdmin.from("downloads").select("id,session_id,ip,file_name").eq("id", token).maybeSingle();
}
async function findLatestDownloadBySession(supabaseAdmin, sessionId, fileName) {
	if (!sessionId) return {
		data: null,
		error: null
	};
	let byStartedAt = await supabaseAdmin.from("downloads").select("id,session_id,ip,file_name").eq("session_id", sessionId).eq("file_name", fileName).order("started_at", { ascending: false }).limit(1).maybeSingle();
	if (!byStartedAt.error) return {
		data: byStartedAt.data,
		error: null
	};
	if (!/started_at|schema cache|column .* does not exist|Could not find .* column/i.test(byStartedAt.error.message)) return byStartedAt;
	return supabaseAdmin.from("downloads").select("id,session_id,ip,file_name").eq("session_id", sessionId).eq("file_name", fileName).order("created_at", { ascending: false }).limit(1).maybeSingle();
}
async function findLatestDownloadByIp(supabaseAdmin, ip, fileName) {
	if (!ip) return {
		data: null,
		error: null
	};
	let byStartedAt = await supabaseAdmin.from("downloads").select("id,session_id,ip,file_name").eq("ip", ip).order("started_at", { ascending: false }).limit(1).maybeSingle();
	if (!byStartedAt.error) return {
		data: byStartedAt.data,
		error: null
	};
	if (!/started_at|schema cache|column .* does not exist|Could not find .* column/i.test(byStartedAt.error.message)) return byStartedAt;
	return supabaseAdmin.from("downloads").select("id,session_id,ip,file_name").eq("ip", ip).order("created_at", { ascending: false }).limit(1).maybeSingle();
}
async function findLatestDownloadByFile(supabaseAdmin, fileName) {
	let byStartedAt = await supabaseAdmin.from("downloads").select("id,session_id,ip,file_name,started_at,created_at").eq("file_name", fileName).order("started_at", { ascending: false }).limit(1).maybeSingle();
	if (!byStartedAt.error) return {
		data: byStartedAt.data,
		error: null
	};
	if (!/started_at|schema cache|column .* does not exist|Could not find .* column/i.test(byStartedAt.error.message)) return byStartedAt;
	return supabaseAdmin.from("downloads").select("id,session_id,ip,file_name,created_at").eq("file_name", fileName).order("created_at", { ascending: false }).limit(1).maybeSingle();
}
async function insertExtraction(supabaseAdmin, data) {
	let result = await supabaseAdmin.from("extractions").insert(data);
	if (!result.error || !isRecoverableExtractionInsertError(result.error)) return result;
	const fallback = { ...data };
	delete fallback.download_id;
	delete fallback.file_name;
	delete fallback.device;
	result = await supabaseAdmin.from("extractions").insert(fallback);
	return result;
}
var Route$17 = createFileRoute("/api/public/installed")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const body = await request.json().catch(() => null);
		const fileName = typeof body?.file === "string" && body.file.trim() ? body.file.trim().slice(0, 200) : "LegendsofEternity.exe";
		const bodySessionId = typeof body?.sessionId === "string" && body.sessionId.length >= 8 && body.sessionId.length <= 64 ? body.sessionId : null;
		const meta = getClientMeta(request);
		const installToken = getInstallTokenFromRequest(request, body?.token);
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		let { data: download, error: downloadError } = installToken ? await findDownloadByInstallToken(supabaseAdmin, installToken) : await findLatestDownloadBySession(supabaseAdmin, bodySessionId, fileName);
		if (downloadError) throw downloadError;
		if (!download) {
			const byIp = await findLatestDownloadByIp(supabaseAdmin, meta.ip, fileName);
			if (byIp.error) throw byIp.error;
			download = byIp.data;
		}
		if (!download) {
			const byFile = await findLatestDownloadByFile(supabaseAdmin, fileName);
			if (byFile.error) throw byFile.error;
			download = byFile.data;
		}
		const sessionId = download?.session_id || bodySessionId;
		const installedFileName = download?.file_name || fileName;
		if (sessionId) await recordVisit(request, {
			sessionId,
			path: "/installed"
		});
		const installedAt = (/* @__PURE__ */ new Date()).toISOString();
		if (download?.id) {
			let updateByToken = await supabaseAdmin.from("downloads").update({
				extracted: true,
				completed: true,
				completed_at: installedAt,
				installed_at: installedAt
			}).eq("id", download.id);
			if (updateByToken.error && isSchemaMismatch(updateByToken.error)) updateByToken = await supabaseAdmin.from("downloads").update({
				extracted: true,
				completed: true,
				completed_at: installedAt
			}).eq("id", download.id);
			if (updateByToken.error) throw updateByToken.error;
		}
		const extractionResult = await insertExtraction(supabaseAdmin, {
			download_id: download?.id ?? null,
			session_id: sessionId,
			ip: meta.ip,
			device: meta.device,
			file_name: installedFileName
		});
		if (extractionResult.error) throw extractionResult.error;
		const notificationResult = await insertAdminNotification(supabaseAdmin, {
			type: "installed",
			type_detail: "installed",
			title: "Game Installed",
			body: `${sessionId ? sessionId.slice(0, 8) : meta.ip || "unknown"} - ${installedFileName}`,
			session_id: sessionId,
			ip_address: meta.ip,
			country: meta.country,
			browser: meta.browser,
			device: meta.device,
			filename: installedFileName,
			payload: {
				download_id: download?.id ?? null,
				session_id: sessionId,
				ip_address: meta.ip,
				file_name: installedFileName,
				installed: true,
				matched_download: Boolean(download?.id)
			},
			read: false,
			delivered: false
		});
		if (!notificationResult.ok) console.error("[Installed] notification insert failed", notificationResult.error);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store",
				"Set-Cookie": clearInstallTokenCookie()
			}
		});
	} catch (error) {
		console.error("[Installed] tracking failed", error);
		return new Response(JSON.stringify({ success: false }), {
			status: 500,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
	}
} } } });
var PUBLIC_ARCHIVE_NAME$1 = "LegendsofEternity.exe";
var KNOWN_PUBLIC_ARCHIVE_SIZE$1 = 134015488;
function cleanNumber(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) && number >= 0 ? number : fallback;
}
function stripUnavailableColumns(data, errorMessage) {
	const next = { ...data };
	if (/downloaded_bytes|total_bytes|progress_percent|elapsed_seconds/i.test(errorMessage)) {
		delete next.downloaded_bytes;
		delete next.total_bytes;
		delete next.progress_percent;
		delete next.elapsed_seconds;
	}
	if (/completed_at/i.test(errorMessage)) delete next.completed_at;
	if (/completed/i.test(errorMessage)) delete next.completed;
	return next;
}
async function updateDownloadById(id, data) {
	let updateData = { ...data };
	for (let attempt = 0; attempt < 3; attempt += 1) {
		const result = await supabaseAdmin.from("downloads").update(updateData).eq("id", id).select("id").maybeSingle();
		if (!result.error && result.data?.id) return result.data.id;
		if (!result.error) return null;
		console.error("[Download progress] update failed", result.error.message);
		const stripped = stripUnavailableColumns(updateData, result.error.message);
		if (JSON.stringify(stripped) === JSON.stringify(updateData)) return null;
		updateData = stripped;
	}
	return null;
}
async function updateDownload(downloadId, sessionId, data) {
	if (downloadId) {
		const byId = await updateDownloadById(downloadId, data);
		if (byId) return byId;
	}
	if (sessionId) {
		let latest = await supabaseAdmin.from("downloads").select("id").eq("session_id", sessionId).eq("file_name", PUBLIC_ARCHIVE_NAME$1).order("started_at", { ascending: false }).limit(1).maybeSingle();
		if (latest.error && /started_at|schema cache|column .* does not exist|Could not find .* column/i.test(latest.error.message)) latest = await supabaseAdmin.from("downloads").select("id").eq("session_id", sessionId).eq("file_name", PUBLIC_ARCHIVE_NAME$1).order("created_at", { ascending: false }).limit(1).maybeSingle();
		if (!latest.error && latest.data?.id) {
			const bySession = await updateDownloadById(latest.data.id, data);
			if (bySession) return bySession;
		}
		if (latest.error) console.error("[Download progress] lookup by session failed", latest.error.message);
	}
	return null;
}
async function insertFallbackDownload(request, sessionId, data) {
	const meta = getClientMeta(request);
	const country = meta.country ?? await resolveCountry(request.headers, meta.ip);
	const minimalRecord = {
		file_name: PUBLIC_ARCHIVE_NAME$1,
		ip: meta.ip,
		country,
		browser: meta.browser,
		os: meta.os,
		user_agent: meta.ua
	};
	const result = await supabaseAdmin.from("downloads").insert(minimalRecord).select("id").maybeSingle();
	if (result.error) throw result.error;
	const id = result.data?.id ?? null;
	if (id) await updateDownloadById(id, {
		session_id: sessionId,
		device: meta.device,
		started_at: (/* @__PURE__ */ new Date()).toISOString(),
		...data
	});
	return id;
}
var Route$16 = createFileRoute("/api/public/download-progress")({ server: { handlers: { POST: async ({ request }) => {
	try {
		const body = await request.json().catch(() => null);
		const downloadId = typeof body?.downloadId === "string" && body.downloadId ? body.downloadId : null;
		const sessionId = typeof body?.sessionId === "string" && body.sessionId ? body.sessionId : null;
		const downloadedBytes = Math.round(cleanNumber(body?.downloadedBytes));
		const totalBytes = Math.round(cleanNumber(body?.totalBytes, KNOWN_PUBLIC_ARCHIVE_SIZE$1) || KNOWN_PUBLIC_ARCHIVE_SIZE$1);
		const elapsedSeconds = Math.round(cleanNumber(body?.elapsedSeconds));
		const completed = body?.completed === true;
		const data = {
			downloaded_bytes: downloadedBytes,
			total_bytes: totalBytes,
			progress_percent: completed ? 100 : Math.max(0, Math.min(99, Math.round(cleanNumber(body?.percent) || (totalBytes > 0 ? downloadedBytes / totalBytes * 100 : 0)))),
			elapsed_seconds: elapsedSeconds,
			completed,
			...completed ? { completed_at: (/* @__PURE__ */ new Date()).toISOString() } : {}
		};
		let id = await updateDownload(downloadId, sessionId, data);
		if (!id && body?.create === true) id = await insertFallbackDownload(request, sessionId, {
			...data,
			completed,
			progress_percent: completed ? 100 : 0,
			downloaded_bytes: completed ? downloadedBytes : 0,
			elapsed_seconds
		});
		return new Response(JSON.stringify({
			success: true,
			downloadId: id
		}), { headers: {
			"content-type": "application/json",
			"Cache-Control": "no-store"
		} });
	} catch (error) {
		console.error("[Download progress] update failed", error);
		return new Response(JSON.stringify({ success: false }), {
			status: 500,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
	}
} } } });
var PUBLIC_ARCHIVE_NAME = "LegendsofEternity.exe";
var PUBLIC_ARCHIVE_PATH = `/${encodeURIComponent(PUBLIC_ARCHIVE_NAME)}`;
var MIN_VALID_ARCHIVE_SIZE = 1e6;
var KNOWN_PUBLIC_ARCHIVE_SIZE = 134015488;
var GITHUB_LFS_ARCHIVE_URL = "https://media.githubusercontent.com/media/ryoheina/game/main/public/LegendsofEternity.exe";
function isUuid(value) {
	return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
async function getPublicArchiveSize() {
	try {
		const [{ stat }, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
		const candidates = [path.join(processModule.cwd(), "public", PUBLIC_ARCHIVE_NAME), path.join(processModule.cwd(), ".output", "public", PUBLIC_ARCHIVE_NAME)];
		for (const candidate of candidates) try {
			const file = await stat(candidate);
			if (file.isFile() && file.size > 0) return file.size;
		} catch {}
	} catch {}
	return KNOWN_PUBLIC_ARCHIVE_SIZE;
}
function getHeaderValue(headers, names) {
	for (const name of names) {
		const value = headers.get(name);
		if (value) return value;
	}
	return null;
}
function getNetworkMeta(request, country) {
	const ipCity = getHeaderValue(request.headers, ["x-vercel-ip-city", "cf-ipcity"]);
	return {
		ip_country: getHeaderValue(request.headers, ["x-vercel-ip-country", "cf-ipcountry"]) || country,
		ip_city: ipCity ? decodeURIComponent(ipCity) : null,
		asn: getHeaderValue(request.headers, ["x-vercel-ip-as-number", "cf-asn"]),
		isp: getHeaderValue(request.headers, ["x-vercel-ip-as-name", "cf-isp"])
	};
}
function getMinimalDownloadRecord(record) {
	return {
		file_name: record.file_name,
		ip: record.ip,
		country: record.country,
		browser: record.browser,
		os: record.os,
		user_agent: record.user_agent
	};
}
async function updateDownloadProgress(downloadId, data) {
	if (!downloadId) return;
	let updateData = { ...data };
	for (let attempt = 0; attempt < 3; attempt += 1) {
		const { error } = await supabaseAdmin.from("downloads").update(updateData).eq("id", downloadId);
		if (!error) return;
		if (!/downloaded_bytes|total_bytes|progress_percent|elapsed_seconds|completed_at|completed|schema cache|column .* does not exist|Could not find .* column/i.test(error.message)) throw error;
		const nextData = { ...updateData };
		if (/downloaded_bytes|total_bytes|progress_percent|elapsed_seconds/i.test(error.message)) {
			delete nextData.downloaded_bytes;
			delete nextData.total_bytes;
			delete nextData.progress_percent;
			delete nextData.elapsed_seconds;
		}
		if (/completed_at/i.test(error.message)) delete nextData.completed_at;
		if (/completed/i.test(error.message)) delete nextData.completed;
		if (JSON.stringify(nextData) === JSON.stringify(updateData)) return;
		updateData = nextData;
	}
}
var Route$15 = createFileRoute("/api/public/download")({ server: { handlers: { GET: async ({ request }) => {
	const meta = getClientMeta(request);
	const country = meta.country ?? await resolveCountry(request.headers, meta.ip);
	const networkMeta = getNetworkMeta(request, country);
	const url = new URL(request.url);
	const sid = url.searchParams.get("sid") || null;
	const requestedDownloadId = url.searchParams.get("did");
	const downloadFileName = PUBLIC_ARCHIVE_NAME;
	const installToken = createInstallToken();
	let downloadId = isUuid(requestedDownloadId) ? requestedDownloadId : null;
	let installTokenSaved = false;
	let installCookie = null;
	try {
		const now = (/* @__PURE__ */ new Date()).toISOString();
		if (sid) {
			const { data: existingSession } = await supabaseAdmin.from("sessions").select("session_id").eq("session_id", sid).maybeSingle();
			if (existingSession) await supabaseAdmin.from("sessions").update({
				last_active: now,
				ip: meta.ip,
				country,
				browser: meta.browser,
				device: meta.device,
				user_agent: meta.ua,
				notified_left: false
			}).eq("session_id", sid);
			else await supabaseAdmin.from("sessions").insert({
				session_id: sid,
				ip: meta.ip,
				country,
				browser: meta.browser,
				device: meta.device,
				user_agent: meta.ua,
				first_visit: now,
				last_active: now
			});
		}
		const downloadRecord = {
			file_name: downloadFileName,
			session_id: sid,
			ip: meta.ip,
			country,
			...networkMeta,
			browser: meta.browser,
			os: meta.os,
			device: meta.device,
			user_agent: meta.ua,
			extracted: false,
			install_token: installToken,
			started_at: now,
			downloaded_bytes: 0,
			total_bytes: KNOWN_PUBLIC_ARCHIVE_SIZE,
			progress_percent: 0,
			elapsed_seconds: 0
		};
		if (downloadId) {
			const updateResult = await supabaseAdmin.from("downloads").update(getMinimalDownloadRecord(downloadRecord)).eq("id", downloadId).select("id").maybeSingle();
			if (updateResult.error || !updateResult.data?.id) downloadId = null;
			else {
				installTokenSaved = true;
				await updateDownloadProgress(downloadId, {
					total_bytes: KNOWN_PUBLIC_ARCHIVE_SIZE,
					progress_percent: 0,
					downloaded_bytes: 0,
					elapsed_seconds: 0
				}).catch(() => {});
				await supabaseAdmin.from("downloads").update({
					session_id: sid,
					device: meta.device,
					extracted: false,
					install_token: installToken,
					started_at: now,
					...networkMeta
				}).eq("id", downloadId).catch?.(() => {});
			}
		}
		if (!downloadId) {
			const insertResult = await supabaseAdmin.from("downloads").insert(getMinimalDownloadRecord(downloadRecord)).select("id").maybeSingle();
			if (insertResult.error) throw insertResult.error;
			downloadId = insertResult.data?.id || null;
			installTokenSaved = true;
			if (downloadId) {
				await updateDownloadProgress(downloadId, {
					total_bytes: KNOWN_PUBLIC_ARCHIVE_SIZE,
					progress_percent: 0,
					downloaded_bytes: 0,
					elapsed_seconds: 0
				}).catch(() => {});
				await supabaseAdmin.from("downloads").update({
					session_id: sid,
					device: meta.device,
					extracted: false,
					install_token: installToken,
					started_at: now,
					...networkMeta
				}).eq("id", downloadId).catch?.(() => {});
			}
		}
		if (downloadId) installCookie = createInstallTokenCookie(installTokenSaved ? installToken : downloadId);
	} catch (e) {
		console.error("download log failed", e);
	}
	const archiveUrl = new URL(PUBLIC_ARCHIVE_PATH, request.url);
	try {
		let assetResponse = await fetch(archiveUrl, { headers: {
			Accept: "application/octet-stream, */*",
			"x-internal-download-fetch": "1"
		} });
		if (!assetResponse.ok || !assetResponse.body) return new Response(JSON.stringify({
			success: false,
			error: "Game file not found."
		}), {
			status: 404,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store",
				...installCookie ? { "Set-Cookie": installCookie } : {}
			}
		});
		const headerContentLength = Number(assetResponse.headers.get("content-length") || "0");
		const fileContentLength = await getPublicArchiveSize();
		let contentLength = headerContentLength > 0 ? headerContentLength : fileContentLength;
		if (contentLength > 0 && contentLength < MIN_VALID_ARCHIVE_SIZE) {
			const remoteResponse = await fetch(GITHUB_LFS_ARCHIVE_URL, { headers: {
				Accept: "application/octet-stream, */*",
				"User-Agent": "LegendsOfEternityDownloadProxy/1.0"
			} });
			if (!remoteResponse.ok || !remoteResponse.body) return new Response(JSON.stringify({
				success: false,
				error: "Game file not found."
			}), {
				status: 404,
				headers: {
					"content-type": "application/json",
					"Cache-Control": "no-store",
					...installCookie ? { "Set-Cookie": installCookie } : {}
				}
			});
			assetResponse = remoteResponse;
			contentLength = Number(remoteResponse.headers.get("content-length") || "0") || KNOWN_PUBLIC_ARCHIVE_SIZE;
		}
		if (downloadId && contentLength > 0) await updateDownloadProgress(downloadId, {
			total_bytes: contentLength,
			progress_percent: 0,
			downloaded_bytes: 0,
			elapsed_seconds: 0
		}).catch((e) => console.error("initial download progress update failed", e));
		const { readable, writable } = new TransformStream();
		const startedAt = Date.now();
		(async () => {
			const reader = assetResponse.body.getReader();
			const writer = writable.getWriter();
			let downloadedBytes = 0;
			let lastProgressUpdateAt = 0;
			try {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					if (!value) continue;
					downloadedBytes += value.length;
					const nowMs = Date.now();
					if (downloadId && nowMs - lastProgressUpdateAt >= 1e3) {
						lastProgressUpdateAt = nowMs;
						const elapsedSeconds = Math.max(0, Math.round((nowMs - startedAt) / 1e3));
						const progressPercent = contentLength > 0 ? Math.min(99, Math.round(downloadedBytes / contentLength * 100)) : 0;
						await updateDownloadProgress(downloadId, {
							downloaded_bytes: downloadedBytes,
							total_bytes: contentLength,
							progress_percent: progressPercent,
							elapsed_seconds: elapsedSeconds
						}).catch((e) => console.error("download progress update failed", e));
					}
					await writer.write(value);
				}
				if (downloadId) {
					const finalServerPercent = contentLength > 0 ? Math.min(99, Math.round(downloadedBytes / contentLength * 100)) : 99;
					await updateDownloadProgress(downloadId, {
						downloaded_bytes: downloadedBytes,
						total_bytes: contentLength || downloadedBytes,
						progress_percent: finalServerPercent,
						elapsed_seconds: Math.max(0, Math.round((Date.now() - startedAt) / 1e3))
					});
				}
				await writer.close();
			} catch (e) {
				try {
					await writer.abort(e);
				} catch {}
				console.error("download stream failed", e);
			}
		})();
		const headers = new Headers({
			"Content-Type": assetResponse.headers.get("content-type") || "application/vnd.microsoft.portable-executable",
			"Content-Disposition": `attachment; filename="${downloadFileName}"`,
			"Cache-Control": "no-store",
			...installCookie ? { "Set-Cookie": installCookie } : {}
		});
		if (downloadId) headers.set("X-Download-Id", downloadId);
		const contentLengthHeader = assetResponse.headers.get("content-length");
		headers.set("Content-Length", contentLengthHeader || String(contentLength || KNOWN_PUBLIC_ARCHIVE_SIZE));
		return new Response(readable, {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Download] public archive request failed", {
			archiveUrl: archiveUrl.toString(),
			error
		});
		return new Response(JSON.stringify({
			success: false,
			error: "Game file not found."
		}), {
			status: 404,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
	}
} } } });
var COOKIE_NAME = "me_admin";
var DEFAULT_MAX_AGE = 10080 * 60;
function base64url(input) {
	return input.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function sign(data, secret) {
	return base64url(crypto$1.createHmac("sha256", secret).update(data).digest());
}
function createAuthToken(secret, maxAgeSeconds = DEFAULT_MAX_AGE) {
	const payload = JSON.stringify({
		u: "admin",
		exp: Date.now() + maxAgeSeconds * 1e3
	});
	const b = base64url(Buffer.from(payload));
	return `${b}.${sign(b, secret)}`;
}
function verifyAuthToken(token, secret) {
	if (!token) return false;
	const parts = token.split(".");
	if (parts.length !== 2) return false;
	const [b, sig] = parts;
	const expected = sign(b, secret);
	const a = Buffer.from(sig);
	const e = Buffer.from(expected);
	if (a.length !== e.length) return false;
	if (!crypto$1.timingSafeEqual(a, e)) return false;
	try {
		const payload = JSON.parse(Buffer.from(b, "base64").toString());
		if (typeof payload.exp !== "number") return false;
		return payload.exp > Date.now();
	} catch {
		return false;
	}
}
function buildSetCookie(token, opts) {
	const maxAge = opts?.maxAge ?? DEFAULT_MAX_AGE;
	const path = opts?.path ?? "/";
	const secure = opts?.secure ?? true;
	const parts = [
		`${COOKIE_NAME}=${token}`,
		`HttpOnly`,
		`Path=${path}`,
		`Max-Age=${maxAge}`,
		`SameSite=Strict`
	];
	if (secure) parts.push("Secure");
	return parts.join("; ");
}
function buildClearCookie() {
	return `${COOKIE_NAME}=deleted; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`;
}
function getTokenFromRequest(request) {
	const cookie = request.headers.get("cookie");
	if (!cookie) return null;
	const parts = cookie.split(";").map((s) => s.trim());
	for (const p of parts) if (p.startsWith("me_admin=")) return p.substring(9);
	return null;
}
var Route$14 = createFileRoute("/api/me/stats")({ server: { handlers: { GET: async ({ request }) => {
	if (!verifyAuthToken(getTokenFromRequest(request), processModule.env.ADMIN_PASSWORD || "")) return new Response(JSON.stringify({
		ok: false,
		error: "Unauthorized"
	}), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	try {
		const missingEnv = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"].filter((name) => !processModule.env[name]);
		if (missingEnv.length > 0) {
			const message = `Missing environment variables: ${missingEnv.join(", ")}`;
			console.error("me/stats env error", message);
			return new Response(JSON.stringify({
				ok: false,
				error: message
			}), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		(/* @__PURE__ */ new Date(Date.now() - 24 * 36e5)).toISOString();
		const since5m = (/* @__PURE__ */ new Date(Date.now() - 5 * 6e4)).toISOString();
		const sinceToday = new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0)).toISOString();
		const [visitsTotal, visitsToday, onlineNow, downloadsTotal, recentVisits, recentDownloads] = await Promise.all([
			supabaseAdmin.from("visits").select("*", {
				count: "exact",
				head: true
			}),
			supabaseAdmin.from("visits").select("*", {
				count: "exact",
				head: true
			}).gte("created_at", sinceToday),
			supabaseAdmin.from("visits").select("session_id", { count: "exact" }).gte("created_at", since5m),
			supabaseAdmin.from("downloads").select("*", {
				count: "exact",
				head: true
			}),
			supabaseAdmin.from("visits").select("*").order("created_at", { ascending: false }).limit(15),
			supabaseAdmin.from("downloads").select("*").order("created_at", { ascending: false }).limit(15)
		]);
		if (visitsTotal.error || visitsToday.error || onlineNow.error || downloadsTotal.error || recentVisits.error || recentDownloads.error) {
			const errors = [
				visitsTotal.error,
				visitsToday.error,
				onlineNow.error,
				downloadsTotal.error,
				recentVisits.error,
				recentDownloads.error
			].filter(Boolean).map((err) => err?.message ?? String(err));
			console.error("me/stats supabase errors", errors);
			return new Response(JSON.stringify({
				ok: false,
				error: errors.join("; ")
			}), {
				status: 500,
				headers: { "Content-Type": "application/json" }
			});
		}
		const uniqueOnline = new Set((onlineNow.data || []).map((r) => r.session_id)).size;
		return new Response(JSON.stringify({
			totals: {
				visits: visitsTotal.count || 0,
				today: visitsToday.count || 0,
				online: uniqueOnline,
				downloads: downloadsTotal.count || 0
			},
			recentVisits: recentVisits.data || [],
			recentDownloads: recentDownloads.data || []
		}), {
			status: 200,
			headers: { "Content-Type": "application/json" }
		});
	} catch (e) {
		const message = e instanceof Error ? e.message : String(e);
		const stack = e instanceof Error ? e.stack : void 0;
		console.error("me/stats error", message, stack);
		return new Response(JSON.stringify({
			ok: false,
			error: "Server error",
			details: message,
			stack
		}), {
			status: 500,
			headers: { "Content-Type": "application/json" }
		});
	}
} } } });
var Route$13 = createFileRoute("/api/me/logout")({ server: { handlers: { POST: async () => {
	const header = buildClearCookie();
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Set-Cookie": header
		}
	});
} } } });
var Route$12 = createFileRoute("/api/me/login")({ server: { handlers: { POST: async ({ request }) => {
	const body = await request.json().catch(() => ({}));
	const password = typeof body.password === "string" ? body.password : null;
	const adminPassword = processModule.env.ADMIN_PASSWORD || processModule.env.STUDIO_ADMIN_PASSWORD || null;
	if (!adminPassword) return new Response(JSON.stringify({
		ok: false,
		error: "ADMIN_PASSWORD not configured"
	}), {
		status: 500,
		headers: { "Content-Type": "application/json" }
	});
	if (!password || password !== adminPassword) return new Response(JSON.stringify({
		ok: false,
		error: "Invalid credentials"
	}), {
		status: 401,
		headers: { "Content-Type": "application/json" }
	});
	const setCookie = buildSetCookie(createAuthToken(adminPassword));
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Set-Cookie": setCookie
		}
	});
} } } });
var ADMIN_PASSWORD$1 = processModule.env.ADMIN_PASSWORD || processModule.env.STUDIO_ADMIN_PASSWORD;
var ADMIN_COOKIE_NAME = "admin-auth-token";
var ADMIN_SESSION_MAX_AGE_SECONDS = 3600 * 8;
function getAdminPassword() {
	return ADMIN_PASSWORD$1 || "";
}
async function signAdminPayload(secret, payload) {
	if (!secret) throw new Error("ADMIN_PASSWORD is not configured");
	const encoder = new TextEncoder();
	const key = await globalThis.crypto.subtle.importKey("raw", encoder.encode(secret), {
		name: "HMAC",
		hash: "SHA-256"
	}, false, ["sign"]);
	const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(payload));
	return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
function constantTimeEqual(a, b) {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return result === 0;
}
async function isAdminAuthorized(request) {
	const password = getAdminPassword();
	if (!password) return false;
	const cookieHeader = request.headers.get("cookie") || "";
	const cookieValue = Object.fromEntries(cookieHeader.split(";").map((chunk) => {
		const [name, ...rest] = chunk.trim().split("=");
		return [name, rest.join("=")];
	}))[ADMIN_COOKIE_NAME];
	if (!cookieValue) return false;
	const [issuedAtRaw, signature] = cookieValue.split(".");
	const issuedAt = Number(issuedAtRaw);
	if (!Number.isFinite(issuedAt) || !signature) return false;
	if (Date.now() - issuedAt > ADMIN_SESSION_MAX_AGE_SECONDS * 1e3) return false;
	return constantTimeEqual(signature, await signAdminPayload(password, `studio-admin-auth.${issuedAtRaw}`));
}
async function createAdminAuthCookie() {
	const password = getAdminPassword();
	const issuedAt = String(Date.now());
	return `${ADMIN_COOKIE_NAME}=${`${issuedAt}.${await signAdminPayload(password, `studio-admin-auth.${issuedAt}`)}`}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${ADMIN_SESSION_MAX_AGE_SECONDS}; Secure`;
}
async function clearAdminAuthCookie() {
	return `${ADMIN_COOKIE_NAME}=deleted; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; Secure`;
}
function createErrorPayload$8(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
var Route$11 = createFileRoute("/api/admin/mark-notification-read")({ server: { handlers: { POST: async ({ request }) => {
	const headers = { "content-type": "application/json" };
	try {
		if (!await isAdminAuthorized(request)) return new Response(JSON.stringify({
			success: false,
			error: "Unauthorized"
		}), {
			status: 401,
			headers
		});
		const id = (await request.json().catch(() => null))?.id;
		if (!id) return new Response(JSON.stringify({
			success: false,
			error: "Missing id"
		}), {
			status: 400,
			headers
		});
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		const res = await supabaseAdmin.from("notifications").update({ read: true }).eq("id", id);
		if (res.error) return new Response(JSON.stringify(createErrorPayload$8(res.error)), {
			status: 500,
			headers
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Mark notification read]", error);
		return new Response(JSON.stringify(createErrorPayload$8(error)), {
			status: 500,
			headers
		});
	}
} } } });
var Route$10 = createFileRoute("/api/admin/logout")({ server: { handlers: { POST: async () => {
	return new Response(JSON.stringify({ ok: true }), {
		status: 200,
		headers: {
			"content-type": "application/json",
			"set-cookie": clearAdminAuthCookie()
		}
	});
} } } });
var ADMIN_PASSWORD = processModule.env.ADMIN_PASSWORD || processModule.env.STUDIO_ADMIN_PASSWORD;
var loginAttempts = /* @__PURE__ */ new Map();
var MAX_LOGIN_ATTEMPTS = 6;
var LOGIN_WINDOW_MS = 600 * 1e3;
function getEnvPresence$1() {
	return {
		ADMIN_PASSWORD: Boolean(processModule.env.ADMIN_PASSWORD || processModule.env.STUDIO_ADMIN_PASSWORD),
		SUPABASE_URL: Boolean(processModule.env.SUPABASE_URL),
		SUPABASE_SERVICE_ROLE_KEY: Boolean(processModule.env.SUPABASE_SERVICE_ROLE_KEY),
		SUPABASE_PUBLISHABLE_KEY: Boolean(processModule.env.SUPABASE_PUBLISHABLE_KEY)
	};
}
function logAdminRouteFailure$1(error, context = {}) {
	const payload = {
		route: "/api/admin/login",
		env: getEnvPresence$1(),
		nodeEnv: "production",
		vercelEnv: processModule.env.VERCEL_ENV ?? "undefined",
		...context
	};
	if (error instanceof Error) {
		console.error("[Admin login] Runtime exception", {
			...payload,
			message: error.message,
			name: error.name,
			stack: error.stack
		});
		console.error(error);
		return;
	}
	console.error("[Admin login] Runtime exception", {
		...payload,
		error
	});
}
function createErrorPayload$7(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
function getClientKey(request) {
	return request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
function isRateLimited(key) {
	const now = Date.now();
	const record = loginAttempts.get(key);
	if (!record || record.resetAt <= now) {
		loginAttempts.set(key, {
			count: 1,
			resetAt: now + LOGIN_WINDOW_MS
		});
		return false;
	}
	record.count += 1;
	return record.count > MAX_LOGIN_ATTEMPTS;
}
function clearRateLimit(key) {
	loginAttempts.delete(key);
}
var Route$9 = createFileRoute("/api/admin/login")({ server: { handlers: { POST: async ({ request }) => {
	const clientKey = getClientKey(request);
	console.error("[Admin login] Request started", {
		route: "/api/admin/login",
		env: getEnvPresence$1(),
		nodeEnv: "production",
		vercelEnv: processModule.env.VERCEL_ENV ?? "undefined"
	});
	try {
		const password = (await request.json().catch(() => null))?.password;
		if (isRateLimited(clientKey)) return new Response(JSON.stringify({
			success: false,
			error: "Too many login attempts. Try again later."
		}), {
			status: 429,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
		if (!ADMIN_PASSWORD || password !== ADMIN_PASSWORD) return new Response(JSON.stringify({
			success: false,
			error: "Invalid password."
		}), {
			status: 401,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store"
			}
		});
		clearRateLimit(clientKey);
		const cookie = await createAdminAuthCookie();
		return new Response(JSON.stringify({
			success: true,
			ok: true
		}), {
			status: 200,
			headers: {
				"content-type": "application/json",
				"Cache-Control": "no-store",
				"set-cookie": cookie
			}
		});
	} catch (error) {
		logAdminRouteFailure$1(error, { stage: "handler" });
		return new Response(JSON.stringify(createErrorPayload$7(error)), {
			status: 500,
			headers: { "content-type": "application/json" }
		});
	}
} } } });
var Route$8 = createFileRoute("/api/admin/log-notification")({ server: { handlers: { POST: async ({ request }) => {
	console.log("[Log Notification] Request started");
	try {
		if (!await isAdminAuthorized(request)) {
			console.log("[Log Notification] Admin auth failed");
			return new Response(JSON.stringify({
				success: false,
				error: "Unauthorized"
			}), {
				status: 401,
				headers: { "content-type": "application/json" }
			});
		}
		const body = await request.json().catch(() => null);
		if (!body) return new Response(JSON.stringify({
			success: false,
			error: "Invalid request body"
		}), {
			status: 400,
			headers: { "content-type": "application/json" }
		});
		const payload = body;
		if (!payload.type || !["visitor", "download"].includes(payload.type)) return new Response(JSON.stringify({
			success: false,
			error: "Invalid type. Must be 'visitor' or 'download'."
		}), {
			status: 400,
			headers: { "content-type": "application/json" }
		});
		if (!payload.session_id || !payload.ip_address || !payload.title) return new Response(JSON.stringify({
			success: false,
			error: "Missing required fields: session_id, ip_address, title"
		}), {
			status: 400,
			headers: { "content-type": "application/json" }
		});
		const result = await insertAdminNotification(supabaseAdmin, {
			type: payload.type,
			type_detail: payload.type,
			title: payload.title,
			body: payload.body || "",
			session_id: payload.session_id,
			ip_address: payload.ip_address,
			country: payload.country || null,
			browser: payload.browser || null,
			device: payload.device || null,
			filename: payload.filename || null,
			payload: {
				session_id: payload.session_id,
				ip_address: payload.ip_address,
				country: payload.country,
				browser: payload.browser,
				device: payload.device,
				filename: payload.filename
			},
			read: false
		});
		if (!result.ok) {
			console.error("[Log Notification] Insert failed:", result.error);
			return new Response(JSON.stringify({
				success: false,
				error: `Failed to store notification: ${result.error?.message || "Unknown error"}`
			}), {
				status: 500,
				headers: { "content-type": "application/json" }
			});
		}
		console.log(`[Log Notification] Notification stored: ${payload.type}`);
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers: { "content-type": "application/json" }
		});
	} catch (error) {
		console.error("[Log Notification] Error:", error);
		return new Response(JSON.stringify({
			success: false,
			error: error instanceof Error ? error.message : "Internal server error"
		}), {
			status: 500,
			headers: { "content-type": "application/json" }
		});
	}
} } } });
function createErrorPayload$6(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
var Route$7 = createFileRoute("/api/admin/delete-user")({ server: { handlers: { POST: async ({ request }) => {
	const headers = { "content-type": "application/json" };
	try {
		if (!await isAdminAuthorized(request)) return new Response(JSON.stringify({
			success: false,
			error: "Unauthorized"
		}), {
			status: 401,
			headers
		});
		const userId = (await request.json().catch(() => null))?.user_id;
		if (!userId || typeof userId !== "string") return new Response(JSON.stringify({
			success: false,
			error: "Missing or invalid user_id"
		}), {
			status: 400,
			headers
		});
		let supabaseAdmin;
		try {
			supabaseAdmin = (await import("./client.server-Cb3GfPp-.mjs")).supabaseAdmin;
			if (!supabaseAdmin) throw new Error("Supabase admin client unavailable");
		} catch (err) {
			console.error("[Delete user] Supabase admin client load failed", err);
			return new Response(JSON.stringify(createErrorPayload$6(err)), {
				status: 500,
				headers
			});
		}
		const cascadeResults = {};
		try {
			cascadeResults.notifications = await supabaseAdmin.from("notifications").delete().eq("user_id", userId);
		} catch (err) {
			cascadeResults.notifications = { error: String(err) };
		}
		try {
			const res = await supabaseAdmin.auth.admin.deleteUser(userId);
			if (res?.error) {
				console.error("[Delete user] supabase.auth.admin.deleteUser error", res.error);
				return new Response(JSON.stringify({
					success: false,
					error: res.error.message || String(res.error),
					details: { cascade: cascadeResults }
				}), {
					status: 500,
					headers
				});
			}
		} catch (err) {
			console.error("[Delete user] admin.deleteUser threw", err, cascadeResults);
			return new Response(JSON.stringify(createErrorPayload$6(err)), {
				status: 500,
				headers
			});
		}
		return new Response(JSON.stringify({
			success: true,
			ok: true,
			cascade: cascadeResults
		}), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Delete user] Unhandled", error);
		return new Response(JSON.stringify(createErrorPayload$6(error)), {
			status: 500,
			headers
		});
	}
} } } });
function createErrorPayload$5(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
var Route$6 = createFileRoute("/api/admin/delete-session")({ server: { handlers: { POST: async ({ request }) => {
	const headers = { "content-type": "application/json" };
	try {
		if (!await isAdminAuthorized(request)) return new Response(JSON.stringify({
			success: false,
			error: "Unauthorized"
		}), {
			status: 401,
			headers
		});
		const id = (await request.json().catch(() => null))?.id;
		if (!id) return new Response(JSON.stringify({
			success: false,
			error: "Missing id"
		}), {
			status: 400,
			headers
		});
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		await supabaseAdmin.from("visits").delete().eq("session_id", id);
		await supabaseAdmin.from("downloads").delete().eq("session_id", id);
		await supabaseAdmin.from("extractions").delete().eq("session_id", id);
		await supabaseAdmin.from("notifications").delete().eq("session_id", id);
		const res = await supabaseAdmin.from("sessions").delete().eq("session_id", id);
		if (res.error) return new Response(JSON.stringify(createErrorPayload$5(res.error)), {
			status: 500,
			headers
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Delete session]", error);
		return new Response(JSON.stringify(createErrorPayload$5(error)), {
			status: 500,
			headers
		});
	}
} } } });
function createErrorPayload$4(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
var Route$5 = createFileRoute("/api/admin/delete-notification")({ server: { handlers: { POST: async ({ request }) => {
	const headers = { "content-type": "application/json" };
	try {
		if (!await isAdminAuthorized(request)) return new Response(JSON.stringify({
			success: false,
			error: "Unauthorized"
		}), {
			status: 401,
			headers
		});
		const id = (await request.json().catch(() => null))?.id;
		if (!id) return new Response(JSON.stringify({
			success: false,
			error: "Missing id"
		}), {
			status: 400,
			headers
		});
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		const res = await supabaseAdmin.from("notifications").delete().eq("id", id);
		if (res.error) return new Response(JSON.stringify(createErrorPayload$4(res.error)), {
			status: 500,
			headers
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Delete notification]", error);
		return new Response(JSON.stringify(createErrorPayload$4(error)), {
			status: 500,
			headers
		});
	}
} } } });
function createErrorPayload$3(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
var Route$4 = createFileRoute("/api/admin/delete-download")({ server: { handlers: { POST: async ({ request }) => {
	const headers = { "content-type": "application/json" };
	try {
		if (!await isAdminAuthorized(request)) return new Response(JSON.stringify({
			success: false,
			error: "Unauthorized"
		}), {
			status: 401,
			headers
		});
		const id = (await request.json().catch(() => null))?.id;
		if (!id) return new Response(JSON.stringify({
			success: false,
			error: "Missing id"
		}), {
			status: 400,
			headers
		});
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		const res = await supabaseAdmin.from("downloads").delete().eq("id", id);
		if (res.error) return new Response(JSON.stringify(createErrorPayload$3(res.error)), {
			status: 500,
			headers
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Delete download]", error);
		return new Response(JSON.stringify(createErrorPayload$3(error)), {
			status: 500,
			headers
		});
	}
} } } });
var ONLINE_WINDOW_MS = 1800 * 1e3;
var OFFLINE_NOTIFICATION_WINDOW_MS = 1800 * 1e3;
function getEnvPresence() {
	return {
		ADMIN_PASSWORD: Boolean(processModule.env.ADMIN_PASSWORD || processModule.env.STUDIO_ADMIN_PASSWORD),
		SUPABASE_URL: Boolean(processModule.env.SUPABASE_URL),
		SUPABASE_SERVICE_ROLE_KEY: Boolean(processModule.env.SUPABASE_SERVICE_ROLE_KEY),
		SUPABASE_PUBLISHABLE_KEY: Boolean(processModule.env.SUPABASE_PUBLISHABLE_KEY)
	};
}
function logAdminRouteFailure(error, context = {}) {
	const payload = {
		route: "/api/admin/dashboard",
		env: getEnvPresence(),
		nodeEnv: "production",
		vercelEnv: processModule.env.VERCEL_ENV ?? "undefined",
		...context
	};
	if (error instanceof Error) {
		console.error("[Admin dashboard] Runtime exception", {
			...payload,
			message: error.message,
			name: error.name,
			stack: error.stack
		});
		console.error(error);
		return;
	}
	console.error("[Admin dashboard] Runtime exception", {
		...payload,
		error
	});
}
function getStatusInfo(session) {
	if (session.notified_left === true) return {
		status: "offline",
		reason: "Explicit page leave signal received"
	};
	const lastActive = session.last_active;
	const last = new Date(lastActive).getTime();
	if (Number.isNaN(last)) return {
		status: "offline",
		reason: "Invalid last_active timestamp"
	};
	const ageMs = Date.now() - last;
	return {
		status: ageMs <= ONLINE_WINDOW_MS ? "online" : "offline",
		reason: ageMs <= ONLINE_WINDOW_MS ? `Heartbeat seen within ${Math.round(ONLINE_WINDOW_MS / 6e4)} minutes` : `No heartbeat for ${Math.round(ageMs / 6e4)} minutes`
	};
}
function notificationIsUnread(notification) {
	return notification.read !== true;
}
var requiredEnvVars = [
	"ADMIN_PASSWORD",
	"SUPABASE_URL",
	"SUPABASE_SERVICE_ROLE_KEY"
];
function logEnvStatus() {
	const status = requiredEnvVars.map((name) => `${name}=${processModule.env[name] ? "set" : "missing"}`).join(", ");
	console.log(`[Dashboard] Required env vars: ${status}`);
}
function createFailureResponse(message, step, error, details, table, column) {
	return {
		success: false,
		error: error instanceof Error ? error.message : typeof error === "string" ? error : message,
		step,
		details,
		table,
		column
	};
}
function parsePostgresError(errorMessage) {
	const tableMatch = /relation "([^"]+)" does not exist/.exec(errorMessage) || /table "([^"]+)" does not exist/.exec(errorMessage);
	const columnMatch = /column "([^"]+)" does not exist/.exec(errorMessage);
	return {
		table: tableMatch?.[1],
		column: columnMatch?.[1]
	};
}
function extractErrorLocation(stack) {
	if (!stack) return "unknown location";
	const lines = stack.split("\n").slice(1);
	const firstFrame = lines.find((line) => line.includes("src/")) || lines[0];
	return firstFrame ? firstFrame.trim() : "unknown location";
}
function getVisitIp(row) {
	return row.visible_ip || row.ip || row.ip_address || null;
}
function getVisitCountry(row) {
	return row.ip_country || row.country || null;
}
function getVisitCity(row) {
	return row.ip_city || row.city || null;
}
function getVisitTimestamp(row) {
	return row.timestamp || row.created_at || row.first_visit || row.started_at || null;
}
function getIpv4Subnet24(ip) {
	if (!ip) return null;
	const parts = ip.trim().split(".");
	if (parts.length !== 4) return null;
	const octets = parts.map((part) => Number(part));
	if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return null;
	return `${octets[0]}.${octets[1]}.${octets[2]}.0/24`;
}
function getHourBucket(timestamp) {
	if (!timestamp) return null;
	const date = new Date(timestamp);
	if (Number.isNaN(date.getTime())) return null;
	date.setMinutes(0, 0, 0);
	return date.toISOString();
}
function hashClusterKey(input) {
	let hash = 2166136261;
	for (let i = 0; i < input.length; i++) {
		hash ^= input.charCodeAt(i);
		hash = Math.imul(hash, 16777619);
	}
	return `net_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
function buildNetworkClusters(rows) {
	const groups = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const ip = getVisitIp(row);
		const subnet24 = getIpv4Subnet24(ip);
		const hourBucket = getHourBucket(getVisitTimestamp(row));
		if (!ip || !subnet24 || !hourBucket) continue;
		const asn = row.asn ? String(row.asn) : "unknown";
		const country = getVisitCountry(row) || "unknown";
		const city = getVisitCity(row) || "unknown";
		const isp = row.isp || "unknown";
		const key = [
			subnet24,
			asn,
			country,
			city,
			hourBucket
		].join("|");
		const existing = groups.get(key) || {
			network_cluster_id: hashClusterKey(key),
			subnet_24: subnet24,
			asn,
			country,
			city,
			isp,
			hour_bucket: hourBucket,
			first_seen: getVisitTimestamp(row),
			last_seen: getVisitTimestamp(row),
			visit_count: 0,
			distinct_ips: /* @__PURE__ */ new Set()
		};
		const timestamp = getVisitTimestamp(row);
		existing.visit_count += 1;
		existing.distinct_ips.add(ip);
		if (timestamp && (!existing.first_seen || new Date(timestamp) < new Date(existing.first_seen))) existing.first_seen = timestamp;
		if (timestamp && (!existing.last_seen || new Date(timestamp) > new Date(existing.last_seen))) existing.last_seen = timestamp;
		groups.set(key, existing);
	}
	return Array.from(groups.values()).map((group) => {
		const ip_list = Array.from(group.distinct_ips).sort();
		const confidenceParts = [
			group.subnet_24 !== "unknown",
			group.asn !== "unknown",
			group.country !== "unknown",
			group.city !== "unknown"
		].filter(Boolean).length;
		return {
			network_cluster_id: group.network_cluster_id,
			subnet_24: group.subnet_24,
			asn: group.asn,
			country: group.country,
			city: group.city,
			isp: group.isp,
			hour_bucket: group.hour_bucket,
			first_seen: group.first_seen,
			last_seen: group.last_seen,
			visit_count: group.visit_count,
			distinct_ip_count: ip_list.length,
			ip_list,
			cluster_confidence: Math.round(confidenceParts / 4 * 100),
			safe_label: `Possible related VPN/network activity: [${ip_list.join(", ")}]`
		};
	}).sort((a, b) => new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime()).slice(0, 25);
}
function getDownloadTime(download) {
	const value = download.started_at || download.created_at || download.completed_at;
	const time = new Date(value || 0).getTime();
	return Number.isFinite(time) ? time : 0;
}
function getDownloadRank(download) {
	const downloadedBytes = Number(download.downloaded_bytes || 0);
	const progressPercent = Number(download.progress_percent || 0);
	const elapsedSeconds = Number(download.elapsed_seconds || 0);
	const hasProgressEvidence = downloadedBytes > 0 || progressPercent > 0 || elapsedSeconds > 0;
	return (download.completed === true && hasProgressEvidence ? 1e9 : 0) + progressPercent * 1e6 + downloadedBytes;
}
function collapseDuplicateDownloads(downloads) {
	const groups = /* @__PURE__ */ new Map();
	for (const download of downloads) {
		const key = [download.session_id || download.ip || "unknown", download.file_name || "unknown"].join("|");
		const group = groups.get(key) || [];
		group.push(download);
		groups.set(key, group);
	}
	return Array.from(groups.values()).map((group) => group.slice().sort((a, b) => {
		const timeDiff = getDownloadTime(b) - getDownloadTime(a);
		if (Math.abs(timeDiff) > 1e4) return timeDiff;
		const rankDiff = getDownloadRank(b) - getDownloadRank(a);
		if (rankDiff !== 0) return rankDiff;
		return timeDiff;
	})[0]).sort((a, b) => getDownloadTime(b) - getDownloadTime(a));
}
function normalizeFileName(value) {
	return typeof value === "string" && value.trim() ? value.trim().toLowerCase() : "legendsofeternity.exe";
}
function getInstallEventTime(event) {
	const value = event.created_at || event.inserted_at || event.timestamp;
	const time = new Date(value || 0).getTime();
	return Number.isFinite(time) ? time : 0;
}
function getInstallEventFile(event) {
	return normalizeFileName(event.file_name || event.filename || event.payload?.file_name);
}
function getVisitPath(event) {
	const path = event.path || event.pathname || event.url || event.payload?.path;
	if (typeof path !== "string") return "";
	try {
		return path.startsWith("http") ? new URL(path).pathname : path;
	} catch {
		return path;
	}
}
function installEventMatchesDownload(event, download) {
	if (getInstallEventFile(event) !== normalizeFileName(download.file_name)) return false;
	if (event.download_id && download.id && event.download_id === download.id) return true;
	if (event.payload?.download_id && download.id && event.payload.download_id === download.id) return true;
	if (event.session_id && download.session_id && event.session_id === download.session_id) return true;
	if (event.payload?.session_id && download.session_id && event.payload.session_id === download.session_id) return true;
	if ((event.ip || event.ip_address || event.payload?.ip_address) && download.ip) {
		if ((event.ip || event.ip_address || event.payload?.ip_address) === download.ip) return true;
	}
	const eventTime = getInstallEventTime(event);
	const downloadTime = getDownloadTime(download);
	return eventTime > 0 && downloadTime > 0 && eventTime >= downloadTime && eventTime - downloadTime <= 1440 * 60 * 1e3;
}
async function verifyDatabaseConnectivity(supabaseAdmin) {
	console.log("[Dashboard] Verifying database connectivity using sessions table...");
	const res = await supabaseAdmin.from("sessions").select("session_id").limit(1);
	if (res.error) {
		const parsed = parsePostgresError(res.error.message);
		console.error("[Dashboard] Database connectivity check failed:", res.error.message);
		return {
			ok: false,
			error: res.error,
			table: parsed.table,
			column: parsed.column,
			details: res.error.message
		};
	}
	console.log("[Dashboard] Database connectivity verified");
	return { ok: true };
}
var Route$3 = createFileRoute("/api/admin/dashboard")({ server: { handlers: { GET: async ({ request }) => {
	const responseHeaders = {
		"content-type": "application/json",
		"Cache-Control": "no-store"
	};
	logEnvStatus();
	console.error("[Admin dashboard] Request started", {
		route: "/api/admin/dashboard",
		env: getEnvPresence(),
		nodeEnv: "production",
		vercelEnv: processModule.env.VERCEL_ENV ?? "undefined",
		requestUrl: request.url
	});
	try {
		const missingEnv = requiredEnvVars.filter((name) => !processModule.env[name]);
		if (missingEnv.length > 0) {
			const message = `Missing required environment variables: ${missingEnv.join(", ")}`;
			console.error("[Dashboard]", message);
			logAdminRouteFailure(new Error(message), {
				stage: "validate_env",
				missingEnv
			});
			return new Response(JSON.stringify(createFailureResponse(message, "validate_env", new Error(message))), {
				status: 500,
				headers: responseHeaders
			});
		}
		try {
			if (!await isAdminAuthorized(request)) {
				console.warn("[Dashboard] Unauthorized access attempt");
				return new Response(JSON.stringify(createFailureResponse("Unauthorized", "authorize", void 0, "Admin auth failed")), {
					status: 401,
					headers: responseHeaders
				});
			}
		} catch (authError) {
			const message = authError instanceof Error ? authError.message : String(authError);
			const location = extractErrorLocation(authError instanceof Error ? authError.stack : void 0);
			console.error("[Dashboard] Authorization failed:", message, location);
			logAdminRouteFailure(authError, {
				stage: "authorize",
				message,
				location
			});
			return new Response(JSON.stringify(createFailureResponse("Authentication failed", "authorize", authError, message)), {
				status: 401,
				headers: responseHeaders
			});
		}
		let supabaseAdmin;
		try {
			console.log("[Dashboard] Importing Supabase admin client");
			supabaseAdmin = (await import("./client.server-Cb3GfPp-.mjs")).supabaseAdmin;
			if (!supabaseAdmin) throw new Error("Supabase admin client import returned undefined");
		} catch (importError) {
			const message = importError instanceof Error ? importError.message : String(importError);
			const stack = importError instanceof Error ? importError.stack || message : String(importError);
			console.error("[Dashboard] Supabase client import failed:", message, stack);
			logAdminRouteFailure(importError, {
				stage: "load_client",
				message,
				stack
			});
			return new Response(JSON.stringify(createFailureResponse("Database client unavailable", "load_client", importError, message)), {
				status: 500,
				headers: responseHeaders
			});
		}
		const connectivity = await verifyDatabaseConnectivity(supabaseAdmin);
		if (!connectivity.ok) {
			const message = connectivity.details || "Database connectivity check failed";
			logAdminRouteFailure(connectivity.error, {
				stage: "database_connectivity",
				message,
				table: connectivity.table,
				column: connectivity.column
			});
			return new Response(JSON.stringify(createFailureResponse(message, "database_connectivity", connectivity.error, connectivity.details, connectivity.table, connectivity.column)), {
				status: 500,
				headers: responseHeaders
			});
		}
		console.log("[Dashboard] Executing sessions query");
		const sessionsRes = await supabaseAdmin.from("sessions").select("*").order("last_active", { ascending: false });
		if (sessionsRes.error) {
			const parsed = parsePostgresError(sessionsRes.error.message);
			console.error("[Dashboard] Sessions query failed:", sessionsRes.error.message);
			logAdminRouteFailure(sessionsRes.error, {
				stage: "query_sessions",
				table: parsed.table,
				column: parsed.column,
				message: sessionsRes.error.message
			});
			return new Response(JSON.stringify(createFailureResponse("Sessions query failed", "query_sessions", sessionsRes.error, sessionsRes.error.message, parsed.table, parsed.column)), {
				status: 500,
				headers: responseHeaders
			});
		}
		const sessions = sessionsRes.data ?? [];
		console.log(`[Dashboard] Sessions fetched: ${sessions.length}`);
		console.log("[Dashboard] Executing downloads query");
		let downloadsRes = await supabaseAdmin.from("downloads").select("*").order("started_at", { ascending: false }).limit(100);
		if (downloadsRes.error && /started_at|schema cache|column .* does not exist|Could not find .* column/i.test(downloadsRes.error.message)) downloadsRes = await supabaseAdmin.from("downloads").select("*").order("created_at", { ascending: false }).limit(100);
		if (downloadsRes.error) {
			const parsed = parsePostgresError(downloadsRes.error.message);
			console.error("[Dashboard] Downloads query failed:", downloadsRes.error.message);
			logAdminRouteFailure(downloadsRes.error, {
				stage: "query_downloads",
				table: parsed.table,
				column: parsed.column,
				message: downloadsRes.error.message
			});
			return new Response(JSON.stringify(createFailureResponse("Downloads query failed", "query_downloads", downloadsRes.error, downloadsRes.error.message, parsed.table, parsed.column)), {
				status: 500,
				headers: responseHeaders
			});
		}
		const downloads = downloadsRes.data ?? [];
		console.log(`[Dashboard] Downloads fetched: ${downloads.length}`);
		console.log("[Dashboard] Executing extractions query");
		const extractionsRes = await supabaseAdmin.from("extractions").select("*").order("created_at", { ascending: false }).limit(200);
		if (extractionsRes.error) {
			const parsed = parsePostgresError(extractionsRes.error.message);
			console.error("[Dashboard] Extractions query failed:", extractionsRes.error.message);
			logAdminRouteFailure(extractionsRes.error, {
				stage: "query_extractions",
				table: parsed.table,
				column: parsed.column,
				message: extractionsRes.error.message
			});
			return new Response(JSON.stringify(createFailureResponse("Extractions query failed", "query_extractions", extractionsRes.error, extractionsRes.error.message, parsed.table, parsed.column)), {
				status: 500,
				headers: responseHeaders
			});
		}
		const extractions = extractionsRes.data ?? [];
		console.log(`[Dashboard] Extractions fetched: ${extractions.length}`);
		console.log("[Dashboard] Executing notifications query");
		const notificationsRes = await supabaseAdmin.from("notifications").select("*").order("created_at", { ascending: false }).limit(50);
		if (notificationsRes.error) {
			const parsed = parsePostgresError(notificationsRes.error.message);
			console.error("[Dashboard] Notifications query failed:", notificationsRes.error.message);
			logAdminRouteFailure(notificationsRes.error, {
				stage: "query_notifications",
				table: parsed.table,
				column: parsed.column,
				message: notificationsRes.error.message
			});
			return new Response(JSON.stringify(createFailureResponse("Notifications query failed", "query_notifications", notificationsRes.error, notificationsRes.error.message, parsed.table, parsed.column)), {
				status: 500,
				headers: responseHeaders
			});
		}
		const notifications = notificationsRes.data ?? [];
		console.log(`[Dashboard] Notifications fetched: ${notifications.length}`);
		console.log("[Dashboard] Executing visits query for network activity clusters");
		const visitsRes = await supabaseAdmin.from("visits").select("*").order("created_at", { ascending: false }).limit(500);
		if (visitsRes.error) {
			const parsed = parsePostgresError(visitsRes.error.message);
			console.warn("[Dashboard] Visits query for network clusters failed:", visitsRes.error.message);
			logAdminRouteFailure(visitsRes.error, {
				stage: "query_network_clusters",
				table: parsed.table,
				column: parsed.column,
				message: visitsRes.error.message
			});
		}
		const visits = visitsRes.data ?? [];
		const networkClusters = buildNetworkClusters([...visits, ...sessions.map((session) => ({
			...session,
			created_at: session.first_visit
		}))]);
		console.log(`[Dashboard] Network clusters built: ${networkClusters.length}`);
		const installedSessionIds = /* @__PURE__ */ new Set([
			...downloads.filter((download) => download.extracted === true).map((download) => download.session_id).filter(Boolean),
			...extractions.map((extraction) => extraction.session_id).filter(Boolean),
			...notifications.filter((notification) => notification.type === "installed" || notification.title === "Game Installed").map((notification) => notification.session_id || notification.payload?.session_id).filter(Boolean)
		]);
		const installedDownloadIds = /* @__PURE__ */ new Set([
			...downloads.filter((download) => download.extracted === true).map((download) => download.id).filter(Boolean),
			...extractions.map((extraction) => extraction.download_id).filter(Boolean),
			...notifications.filter((notification) => notification.type === "installed" || notification.title === "Game Installed").map((notification) => notification.payload?.download_id).filter(Boolean)
		]);
		const installedIps = /* @__PURE__ */ new Set([
			...downloads.filter((download) => download.extracted === true).map((download) => download.ip).filter(Boolean),
			...extractions.map((extraction) => extraction.ip).filter(Boolean),
			...notifications.filter((notification) => notification.type === "installed" || notification.title === "Game Installed").map((notification) => notification.ip_address || notification.payload?.ip_address).filter(Boolean)
		]);
		const installedVisitEvents = visits.filter((visit) => getVisitPath(visit) === "/installed");
		for (const visit of installedVisitEvents) {
			if (visit.session_id) installedSessionIds.add(visit.session_id);
			if (visit.ip) installedIps.add(visit.ip);
		}
		const installedEvents = [
			...extractions,
			...installedVisitEvents.map((visit) => ({
				...visit,
				file_name: "LegendsofEternity.exe"
			})),
			...notifications.filter((notification) => notification.type === "installed" || notification.title === "Game Installed").map((notification) => ({
				...notification,
				file_name: notification.filename || notification.payload?.file_name,
				download_id: notification.payload?.download_id,
				ip: notification.ip_address || notification.payload?.ip_address
			}))
		];
		for (const extraction of extractions) {
			if (extraction.session_id) installedSessionIds.add(extraction.session_id);
			if (!extraction.session_id && extraction.download_id) {
				const matchingDownload = downloads.find((download) => download.id === extraction.download_id);
				if (matchingDownload?.session_id) installedSessionIds.add(matchingDownload.session_id);
			}
			if (!extraction.session_id && extraction.ip) {
				for (const session of sessions) if (session.ip === extraction.ip) installedSessionIds.add(session.session_id);
			}
		}
		const onlineSessions = sessions.map((session) => {
			const statusInfo = getStatusInfo(session);
			return {
				...session,
				installed: installedSessionIds.has(session.session_id) || (session.ip ? installedIps.has(session.ip) : false),
				status: statusInfo.status,
				status_reason: statusInfo.reason,
				last_active_time: session.last_active,
				first_visit_time: session.first_visit
			};
		});
		const enhancedDownloads = collapseDuplicateDownloads(downloads.map((download) => {
			const downloadedBytes = Number(download.downloaded_bytes || 0);
			const progressPercent = Number(download.progress_percent || 0);
			const elapsedSeconds = Number(download.elapsed_seconds || 0);
			const hasProgressEvidence = downloadedBytes > 0 || progressPercent > 0 || elapsedSeconds > 0;
			const inferredComplete = download.completed === true && hasProgressEvidence || Boolean(download.completed_at) || progressPercent >= 100;
			return {
				...download,
				completed: inferredComplete,
				progress_percent: inferredComplete ? 100 : progressPercent,
				installed: download.extracted === true || installedDownloadIds.has(download.id) || installedSessionIds.has(download.session_id) || (download.ip ? installedIps.has(download.ip) : false) || installedEvents.some((event) => installEventMatchesDownload(event, download)),
				status: inferredComplete ? "completed" : "in_progress"
			};
		}));
		const downloadUsers = new Set(enhancedDownloads.map((download) => download.session_id || download.ip || download.user_id).filter(Boolean)).size;
		const completedDownloads = enhancedDownloads.filter((download) => download.completed).length;
		const unreadNotifications = notifications.filter(notificationIsUnread);
		try {
			const pendingOffline = sessions.filter((session) => session.last_active < (/* @__PURE__ */ new Date(Date.now() - OFFLINE_NOTIFICATION_WINDOW_MS)).toISOString() && !session.notified_left);
			if (pendingOffline.length > 0) {
				console.log(`[Dashboard] Creating ${pendingOffline.length} offline notification(s)`);
				await Promise.all(pendingOffline.map((session) => insertAdminNotification(supabaseAdmin, {
					type: "visitor_left",
					type_detail: "visitor",
					title: "Visitor Left",
					body: `${session.ip ?? "unknown"} — ${session.country ?? "unknown"} — ${session.device ?? session.os ?? "Unknown device"}`,
					session_id: session.session_id,
					ip_address: session.ip,
					country: session.country,
					browser: session.browser,
					device: session.device,
					payload: {
						session_id: session.session_id,
						ip_address: session.ip,
						country: session.country
					},
					read: false,
					delivered: false
				})));
				await supabaseAdmin.from("sessions").update({ notified_left: true }).in("session_id", pendingOffline.map((session) => session.session_id));
			}
		} catch (backgroundError) {
			console.warn("[Dashboard] Background update failed:", backgroundError instanceof Error ? backgroundError.message : String(backgroundError));
		}
		const response = {
			success: true,
			sessions: onlineSessions,
			downloads: enhancedDownloads,
			notifications,
			networkClusters,
			stats: {
				total_sessions: onlineSessions.length,
				online_sessions: onlineSessions.filter((s) => s.status === "online").length,
				total_downloads: enhancedDownloads.length,
				download_users: downloadUsers,
				completed_downloads: completedDownloads,
				pending_notifications: unreadNotifications.length
			}
		};
		console.log("[Dashboard] Dashboard handler completed successfully");
		return new Response(JSON.stringify(response), {
			status: 200,
			headers: responseHeaders
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		const stack = error instanceof Error ? error.stack || message : String(error);
		const location = extractErrorLocation(error instanceof Error ? error.stack : void 0);
		console.error("[Dashboard] Unhandled exception:", message, location, stack);
		logAdminRouteFailure(error, {
			stage: "unhandled_exception",
			message,
			location
		});
		return new Response(JSON.stringify(createFailureResponse(message, "unhandled_exception", error, `Unhandled exception at ${location}`)), {
			status: 500,
			headers: responseHeaders
		});
	}
} } } });
function createErrorPayload$2(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
var Route$2 = createFileRoute("/api/admin/clear-notifications")({ server: { handlers: { POST: async ({ request }) => {
	const headers = { "content-type": "application/json" };
	try {
		if (!await isAdminAuthorized(request)) return new Response(JSON.stringify({
			success: false,
			error: "Unauthorized"
		}), {
			status: 401,
			headers
		});
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		const res = await supabaseAdmin.from("notifications").delete().not("id", "is", null);
		if (res.error) return new Response(JSON.stringify(createErrorPayload$2(res.error)), {
			status: 500,
			headers
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Clear notifications]", error);
		return new Response(JSON.stringify(createErrorPayload$2(error)), {
			status: 500,
			headers
		});
	}
} } } });
function createErrorPayload$1(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
async function clearTable(supabaseAdmin, table) {
	const res = await supabaseAdmin.from(table).delete().not("id", "is", null);
	if (res.error) throw res.error;
}
var Route$1 = createFileRoute("/api/admin/clear-history")({ server: { handlers: { POST: async ({ request }) => {
	const headers = { "content-type": "application/json" };
	try {
		if (!await isAdminAuthorized(request)) return new Response(JSON.stringify({
			success: false,
			error: "Unauthorized"
		}), {
			status: 401,
			headers
		});
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		await clearTable(supabaseAdmin, "notifications");
		await clearTable(supabaseAdmin, "downloads");
		await clearTable(supabaseAdmin, "extractions");
		await clearTable(supabaseAdmin, "visits");
		const sessionsRes = await supabaseAdmin.from("sessions").delete().not("session_id", "is", null);
		if (sessionsRes.error) throw sessionsRes.error;
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Clear history]", error);
		return new Response(JSON.stringify(createErrorPayload$1(error)), {
			status: 500,
			headers
		});
	}
} } } });
function createErrorPayload(error) {
	return {
		success: false,
		error: error instanceof Error ? error.message : String(error)
	};
}
var Route = createFileRoute("/api/admin/clear-downloads")({ server: { handlers: { POST: async ({ request }) => {
	const headers = { "content-type": "application/json" };
	try {
		if (!await isAdminAuthorized(request)) return new Response(JSON.stringify({
			success: false,
			error: "Unauthorized"
		}), {
			status: 401,
			headers
		});
		const { supabaseAdmin } = await import("./client.server-Cb3GfPp-.mjs");
		const res = await supabaseAdmin.from("downloads").delete().not("id", "is", null);
		if (res.error) return new Response(JSON.stringify(createErrorPayload(res.error)), {
			status: 500,
			headers
		});
		return new Response(JSON.stringify({ success: true }), {
			status: 200,
			headers
		});
	} catch (error) {
		console.error("[Clear downloads]", error);
		return new Response(JSON.stringify(createErrorPayload(error)), {
			status: 500,
			headers
		});
	}
} } } });
var MeRoute = Route$25.update({
	id: "/me",
	path: "/me",
	getParentRoute: () => Route$26
});
var InstalledRoute = Route$24.update({
	id: "/installed",
	path: "/installed",
	getParentRoute: () => Route$26
});
var AuthRoute = Route$23.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$26
});
var AuthenticatedRouteRoute = Route$22.update({
	id: "/_authenticated",
	getParentRoute: () => Route$26
});
var IndexRoute = Route$21.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$26
});
var AuthenticatedAdminRoute = Route$20.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var ApiPublicVisitRoute = Route$19.update({
	id: "/api/public/visit",
	path: "/api/public/visit",
	getParentRoute: () => Route$26
});
var ApiPublicMarkExtractedRoute = Route$18.update({
	id: "/api/public/mark-extracted",
	path: "/api/public/mark-extracted",
	getParentRoute: () => Route$26
});
var ApiPublicInstalledRoute = Route$17.update({
	id: "/api/public/installed",
	path: "/api/public/installed",
	getParentRoute: () => Route$26
});
var ApiPublicDownloadProgressRoute = Route$16.update({
	id: "/api/public/download-progress",
	path: "/api/public/download-progress",
	getParentRoute: () => Route$26
});
var ApiPublicDownloadRoute = Route$15.update({
	id: "/api/public/download",
	path: "/api/public/download",
	getParentRoute: () => Route$26
});
var ApiMeStatsRoute = Route$14.update({
	id: "/api/me/stats",
	path: "/api/me/stats",
	getParentRoute: () => Route$26
});
var ApiMeLogoutRoute = Route$13.update({
	id: "/api/me/logout",
	path: "/api/me/logout",
	getParentRoute: () => Route$26
});
var ApiMeLoginRoute = Route$12.update({
	id: "/api/me/login",
	path: "/api/me/login",
	getParentRoute: () => Route$26
});
var ApiAdminMarkNotificationReadRoute = Route$11.update({
	id: "/api/admin/mark-notification-read",
	path: "/api/admin/mark-notification-read",
	getParentRoute: () => Route$26
});
var ApiAdminLogoutRoute = Route$10.update({
	id: "/api/admin/logout",
	path: "/api/admin/logout",
	getParentRoute: () => Route$26
});
var ApiAdminLoginRoute = Route$9.update({
	id: "/api/admin/login",
	path: "/api/admin/login",
	getParentRoute: () => Route$26
});
var ApiAdminLogNotificationRoute = Route$8.update({
	id: "/api/admin/log-notification",
	path: "/api/admin/log-notification",
	getParentRoute: () => Route$26
});
var ApiAdminDeleteUserRoute = Route$7.update({
	id: "/api/admin/delete-user",
	path: "/api/admin/delete-user",
	getParentRoute: () => Route$26
});
var ApiAdminDeleteSessionRoute = Route$6.update({
	id: "/api/admin/delete-session",
	path: "/api/admin/delete-session",
	getParentRoute: () => Route$26
});
var ApiAdminDeleteNotificationRoute = Route$5.update({
	id: "/api/admin/delete-notification",
	path: "/api/admin/delete-notification",
	getParentRoute: () => Route$26
});
var ApiAdminDeleteDownloadRoute = Route$4.update({
	id: "/api/admin/delete-download",
	path: "/api/admin/delete-download",
	getParentRoute: () => Route$26
});
var ApiAdminDashboardRoute = Route$3.update({
	id: "/api/admin/dashboard",
	path: "/api/admin/dashboard",
	getParentRoute: () => Route$26
});
var ApiAdminClearNotificationsRoute = Route$2.update({
	id: "/api/admin/clear-notifications",
	path: "/api/admin/clear-notifications",
	getParentRoute: () => Route$26
});
var ApiAdminClearHistoryRoute = Route$1.update({
	id: "/api/admin/clear-history",
	path: "/api/admin/clear-history",
	getParentRoute: () => Route$26
});
var ApiAdminClearDownloadsRoute = Route.update({
	id: "/api/admin/clear-downloads",
	path: "/api/admin/clear-downloads",
	getParentRoute: () => Route$26
});
var AuthenticatedRouteRouteChildren = { AuthenticatedAdminRoute };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	InstalledRoute,
	MeRoute,
	ApiAdminClearDownloadsRoute,
	ApiAdminClearHistoryRoute,
	ApiAdminClearNotificationsRoute,
	ApiAdminDashboardRoute,
	ApiAdminDeleteDownloadRoute,
	ApiAdminDeleteNotificationRoute,
	ApiAdminDeleteSessionRoute,
	ApiAdminDeleteUserRoute,
	ApiAdminLogNotificationRoute,
	ApiAdminLoginRoute,
	ApiAdminLogoutRoute,
	ApiAdminMarkNotificationReadRoute,
	ApiMeLoginRoute,
	ApiMeLogoutRoute,
	ApiMeStatsRoute,
	ApiPublicDownloadRoute,
	ApiPublicDownloadProgressRoute,
	ApiPublicInstalledRoute,
	ApiPublicMarkExtractedRoute,
	ApiPublicVisitRoute
};
var routeTree = Route$26._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: new QueryClient() },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter, supabaseAdmin as t };
