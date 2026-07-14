globalThis.__nitro_main__ = import.meta.url;
import { a as toEventHandler, c as NodeResponse, i as defineLazyEventHandler, l as serve, n as HTTPError, r as defineHandler, t as H3Core } from "./_libs/h3+rou3+srvx.mjs";
import { i as withoutTrailingSlash, n as joinURL, r as withLeadingSlash, t as decodePath } from "./_libs/ufo.mjs";
import { promises } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
//#region #nitro-vite-setup
function lazyService(loader) {
	let promise, mod;
	return { fetch(req) {
		if (mod) return mod.fetch(req);
		if (!promise) promise = loader().then((_mod) => mod = _mod.default || _mod);
		return promise.then((mod) => mod.fetch(req));
	} };
}
var services = { ["ssr"]: lazyService(() => import("./_ssr/ssr.mjs")) };
globalThis.__nitro_vite_envs__ = services;
//#endregion
//#region node_modules/nitro/dist/runtime/internal/route-rules.mjs
var headers = ((m) => function headersRouteRule(event) {
	for (const [key, value] of Object.entries(m.options || {})) event.res.headers.set(key, value);
});
//#endregion
//#region #nitro/virtual/public-assets-data
var public_assets_data_default = {
	"/favicon.ico": {
		"type": "image/vnd.microsoft.icon",
		"etag": "\"19a0a-MKXLxbA4hvZ2k37/YIralha8PDI\"",
		"mtime": "2026-07-06T10:39:51.821Z",
		"size": 104970,
		"path": "../public/favicon.ico"
	},
	"/hero2.mp4": {
		"type": "video/mp4",
		"etag": "\"14871f-pymJF5nN4OiMg5KmVcOx7UY5yAQ\"",
		"mtime": "2026-07-09T04:12:26.904Z",
		"size": 1345311,
		"path": "../public/hero2.mp4"
	},
	"/face.png": {
		"type": "image/png",
		"etag": "\"1f0792-eFEmq3h9qjwRMhZTMITKPNR1JU4\"",
		"mtime": "2026-07-09T21:26:17.428Z",
		"size": 2033554,
		"path": "../public/face.png"
	},
	"/hero1.mp4": {
		"type": "video/mp4",
		"etag": "\"1ba7e6-Wk2CxURlISCjRJ5HYLppVs92Ep4\"",
		"mtime": "2026-07-09T04:19:12.116Z",
		"size": 1812454,
		"path": "../public/hero1.mp4"
	},
	"/hero3.mp4": {
		"type": "video/mp4",
		"etag": "\"1acbf9-bU9JD/vcS7U/I0fK6sem5trUGJM\"",
		"mtime": "2026-07-09T04:12:15.642Z",
		"size": 1756153,
		"path": "../public/hero3.mp4"
	},
	"/game1.png": {
		"type": "image/png",
		"etag": "\"239916-m1u12UM76spJwvYwyyDuXoOGXs4\"",
		"mtime": "2026-07-06T10:39:51.837Z",
		"size": 2332950,
		"path": "../public/game1.png"
	},
	"/hero4.mp4": {
		"type": "video/mp4",
		"etag": "\"21650c-8nUVWn8bdCSR5DDpb4VVhIiCdFs\"",
		"mtime": "2026-07-09T16:30:11.000Z",
		"size": 2188556,
		"path": "../public/hero4.mp4"
	},
	"/game2.png": {
		"type": "image/png",
		"etag": "\"24c166-wnJi3rPG5xUgSA0A3JZVWaNuuH8\"",
		"mtime": "2026-07-06T10:39:51.855Z",
		"size": 2408806,
		"path": "../public/game2.png"
	},
	"/game3.png": {
		"type": "image/png",
		"etag": "\"26612d-e1fd+PEpVzvuzXAZZrs36ZT4bEc\"",
		"mtime": "2026-07-06T10:39:51.873Z",
		"size": 2515245,
		"path": "../public/game3.png"
	},
	"/play10.mp4": {
		"type": "video/mp4",
		"etag": "\"27a7dd-QT2LZNIfDdDvT2Y/C1rDfr8eBV0\"",
		"mtime": "2026-07-11T19:44:41.245Z",
		"size": 2598877,
		"path": "../public/play10.mp4"
	},
	"/play2.mp4": {
		"type": "video/mp4",
		"etag": "\"254666-EgLQk4GXdygH4aejv5cAtE64dlo\"",
		"mtime": "2026-07-11T20:08:03.274Z",
		"size": 2442854,
		"path": "../public/play2.mp4"
	},
	"/play4.mp4": {
		"type": "video/mp4",
		"etag": "\"27827a-Hnb/Z/9NWU9n+D0RZaSnWnp+vn0\"",
		"mtime": "2026-07-11T19:29:13.593Z",
		"size": 2589306,
		"path": "../public/play4.mp4"
	},
	"/play7.mp4": {
		"type": "video/mp4",
		"etag": "\"26f4b2-Cui64ZzEmtBtqvAUwTdNgB1xg8M\"",
		"mtime": "2026-07-11T19:33:46.585Z",
		"size": 2553010,
		"path": "../public/play7.mp4"
	},
	"/play5.mp4": {
		"type": "video/mp4",
		"etag": "\"26c215-OpifKmfGlprL5gpQFJJhKvAEnfY\"",
		"mtime": "2026-07-11T20:07:29.845Z",
		"size": 2540053,
		"path": "../public/play5.mp4"
	},
	"/AZRAEL.png": {
		"type": "image/png",
		"etag": "\"28ef86-IC8QMM4enbaZRfvGlQOkyQeFbGk\"",
		"mtime": "2026-07-06T10:39:51.756Z",
		"size": 2682758,
		"path": "../public/AZRAEL.png"
	},
	"/Background.png": {
		"type": "image/png",
		"etag": "\"2b2666-5981RG2D3WJ/wK7GeX+MNRfBSCw\"",
		"mtime": "2026-07-06T10:39:51.777Z",
		"size": 2827878,
		"path": "../public/Background.png"
	},
	"/ELYSIA.png": {
		"type": "image/png",
		"etag": "\"2fd773-QXnVNrFbDb8I7lh9hb4l43Jq8vs\"",
		"mtime": "2026-07-06T10:39:51.797Z",
		"size": 3135347,
		"path": "../public/ELYSIA.png"
	},
	"/LUCAS.png": {
		"type": "image/png",
		"etag": "\"28b546-CvmltOxAfSPSdWTSDeOg5tOXOBE\"",
		"mtime": "2026-07-06T10:39:51.810Z",
		"size": 2667846,
		"path": "../public/LUCAS.png"
	},
	"/play3.mp4": {
		"type": "video/mp4",
		"etag": "\"283664-svA8qfRbioNeal4e5S5S/X/zHYU\"",
		"mtime": "2026-07-11T19:28:58.008Z",
		"size": 2635364,
		"path": "../public/play3.mp4"
	},
	"/play1.mp4": {
		"type": "video/mp4",
		"etag": "\"2a8db9-hKUHCDnXpQhruzwuhj+DxG/DLx0\"",
		"mtime": "2026-07-11T20:14:14.695Z",
		"size": 2788793,
		"path": "../public/play1.mp4"
	},
	"/play6.mp4": {
		"type": "video/mp4",
		"etag": "\"2e352e-MRWvC8sjs5tLnQ/RWOn/G/JxUb0\"",
		"mtime": "2026-07-11T19:54:08.781Z",
		"size": 3028270,
		"path": "../public/play6.mp4"
	},
	"/background1.mp4": {
		"type": "video/mp4",
		"etag": "\"3a9aaa-QdSS4nn9YTPyDhkTXhK+hQLujpU\"",
		"mtime": "2026-07-09T14:38:39.000Z",
		"size": 3840682,
		"path": "../public/background1.mp4"
	},
	"/background2.mp4": {
		"type": "video/mp4",
		"etag": "\"3cd0bd-GDr+JRnM0xcCOJx/fXdaWIPzZNg\"",
		"mtime": "2026-07-09T15:02:27.000Z",
		"size": 3985597,
		"path": "../public/background2.mp4"
	},
	"/assets/admin-Bpj72KNy.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"6d9d-sMWQ1etzO0/vyPnWUDmxeQNJqXg\"",
		"mtime": "2026-07-14T20:16:34.673Z",
		"size": 28061,
		"path": "../public/assets/admin-Bpj72KNy.js"
	},
	"/assets/auth-Dp94kY3U.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"a21-PxdvtxYtaO8dbxM+opsdUEExnUA\"",
		"mtime": "2026-07-14T20:16:34.675Z",
		"size": 2593,
		"path": "../public/assets/auth-Dp94kY3U.js"
	},
	"/assets/client-BgbAX7Dh.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"31a24-kdiLSeYf7Npbp+DFjikhbHutLWs\"",
		"mtime": "2026-07-14T20:16:34.712Z",
		"size": 203300,
		"path": "../public/assets/client-BgbAX7Dh.js"
	},
	"/assets/fx-CGwUS9qe.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"81c-KGAjSMQ5RTLe0WjhzWsHpKPYTN0\"",
		"mtime": "2026-07-14T20:16:34.714Z",
		"size": 2076,
		"path": "../public/assets/fx-CGwUS9qe.js"
	},
	"/assets/installed-B5Qg79Ut.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"62a-UDSSAuPEmm7KahwvPS1PaTMFsj8\"",
		"mtime": "2026-07-14T20:16:34.716Z",
		"size": 1578,
		"path": "../public/assets/installed-B5Qg79Ut.js"
	},
	"/assets/index-tv1bIFPI.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"5345a-y60TxZFtyJeNQ6d6eDX7QhUczhc\"",
		"mtime": "2026-07-14T20:16:34.672Z",
		"size": 341082,
		"path": "../public/assets/index-tv1bIFPI.js"
	},
	"/assets/me-Di_MdLF7.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"d65-WVWQqzBZNAzZ/w6QJYZxUj14x2I\"",
		"mtime": "2026-07-14T20:16:34.724Z",
		"size": 3429,
		"path": "../public/assets/me-Di_MdLF7.js"
	},
	"/assets/jsx-runtime-D8nDyRPw.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"2210-qrBAUPDOR8ROKpBVNEla8AGnGKU\"",
		"mtime": "2026-07-14T20:16:34.721Z",
		"size": 8720,
		"path": "../public/assets/jsx-runtime-D8nDyRPw.js"
	},
	"/assets/styles-DvNaDs7S.css": {
		"type": "text/css; charset=utf-8",
		"etag": "\"195d3-ncjBV9cqSiy+xQSia4bm3YgfwTg\"",
		"mtime": "2026-07-14T20:16:34.731Z",
		"size": 103891,
		"path": "../public/assets/styles-DvNaDs7S.css"
	},
	"/assets/route-DwB9Up5-.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"8d-ouatW5bWTNVO5IclxMkaSrPFZi4\"",
		"mtime": "2026-07-14T20:16:34.726Z",
		"size": 141,
		"path": "../public/assets/route-DwB9Up5-.js"
	},
	"/assets/routes-BZ4lm8dv.js": {
		"type": "text/javascript; charset=utf-8",
		"etag": "\"25be8-uoQ+Ha9BXqrpuq2aqy+egcAXBBM\"",
		"mtime": "2026-07-14T20:16:34.729Z",
		"size": 154600,
		"path": "../public/assets/routes-BZ4lm8dv.js"
	},
	"/Final.mp4": {
		"type": "video/mp4",
		"etag": "\"4703fd-oprJKm1ujttEf36mOaHX5vYa8zI\"",
		"mtime": "2026-07-10T09:08:13.313Z",
		"size": 4654077,
		"path": "../public/Final.mp4"
	},
	"/play8.mp4": {
		"type": "video/mp4",
		"etag": "\"2dfa89-s/l9/vCSIwf6uUFuobVd194Sf8k\"",
		"mtime": "2026-07-11T19:44:36.186Z",
		"size": 3013257,
		"path": "../public/play8.mp4"
	},
	"/play9.mp4": {
		"type": "video/mp4",
		"etag": "\"287b98-Q3zv7fM0mugJmgEiMusbWQVqXO0\"",
		"mtime": "2026-07-11T19:33:43.696Z",
		"size": 2653080,
		"path": "../public/play9.mp4"
	},
	"/ZEREVOK.png": {
		"type": "image/png",
		"etag": "\"23cf27-dd4lHKipIKmwumTzFWIB7LtoWTc\"",
		"mtime": "2026-07-06T10:39:51.819Z",
		"size": 2346791,
		"path": "../public/ZEREVOK.png"
	},
	"/LegendsofEternity.exe": {
		"type": "application/octet-stream",
		"etag": "\"7fcea00-e5NEH1gH/LD+V0hP0jURgpZCoUQ\"",
		"mtime": "2026-07-14T16:15:50.355Z",
		"size": 134015488,
		"path": "../public/LegendsofEternity.exe"
	}
};
//#endregion
//#region #nitro/virtual/public-assets-node
function readAsset(id) {
	const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
	return promises.readFile(resolve(serverDir, public_assets_data_default[id].path));
}
//#endregion
//#region #nitro/virtual/public-assets
var publicAssetBases = {};
function isPublicAssetURL(id = "") {
	if (public_assets_data_default[id]) return true;
	for (const base in publicAssetBases) if (id.startsWith(base)) return true;
	return false;
}
function getAsset(id) {
	return public_assets_data_default[id];
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/static.mjs
var METHODS = /* @__PURE__ */ new Set(["HEAD", "GET"]);
var EncodingMap = {
	gzip: ".gz",
	br: ".br",
	zstd: ".zst"
};
var static_default = defineHandler((event) => {
	if (event.req.method && !METHODS.has(event.req.method)) return;
	let id = decodePath(withLeadingSlash(withoutTrailingSlash(event.url.pathname)));
	let asset;
	const encodings = [...(event.req.headers.get("accept-encoding") || "").split(",").map((e) => EncodingMap[e.trim()]).filter(Boolean).sort(), ""];
	for (const encoding of encodings) for (const _id of [id + encoding, joinURL(id, "index.html" + encoding)]) {
		const _asset = getAsset(_id);
		if (_asset) {
			asset = _asset;
			id = _id;
			break;
		}
	}
	if (!asset) {
		if (isPublicAssetURL(id)) {
			event.res.headers.delete("Cache-Control");
			throw new HTTPError({ status: 404 });
		}
		return;
	}
	if (encodings.length > 1) event.res.headers.append("Vary", "Accept-Encoding");
	if (event.req.headers.get("if-none-match") === asset.etag) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	const ifModifiedSinceH = event.req.headers.get("if-modified-since");
	const mtimeDate = new Date(asset.mtime);
	if (ifModifiedSinceH && asset.mtime && new Date(ifModifiedSinceH) >= mtimeDate) {
		event.res.status = 304;
		event.res.statusText = "Not Modified";
		return "";
	}
	if (asset.type) event.res.headers.set("Content-Type", asset.type);
	if (asset.etag && !event.res.headers.has("ETag")) event.res.headers.set("ETag", asset.etag);
	if (asset.mtime && !event.res.headers.has("Last-Modified")) event.res.headers.set("Last-Modified", mtimeDate.toUTCString());
	if (asset.encoding && !event.res.headers.has("Content-Encoding")) event.res.headers.set("Content-Encoding", asset.encoding);
	if (asset.size > 0 && !event.res.headers.has("Content-Length")) event.res.headers.set("Content-Length", asset.size.toString());
	return readAsset(id);
});
//#endregion
//#region #nitro/virtual/routing
var findRouteRules = /* @__PURE__ */ (() => {
	const $0 = [{
		name: "headers",
		route: "/assets/**",
		handler: headers,
		options: { "cache-control": "public, max-age=31536000, immutable" }
	}];
	return (m, p) => {
		let r = [];
		if (p.charCodeAt(p.length - 1) === 47) p = p.slice(0, -1) || "/";
		let s = p.split("/");
		if (s.length > 1) {
			if (s[1] === "assets") r.unshift({
				data: $0,
				params: { "_": s.slice(2).join("/") }
			});
		}
		return r;
	};
})();
var _lazy_GPJrZ0 = defineLazyEventHandler(() => import("./_chunks/ssr-renderer.mjs"));
var findRoute = /* @__PURE__ */ (() => {
	const data = {
		route: "/**",
		handler: _lazy_GPJrZ0
	};
	return ((_m, p) => {
		return {
			data,
			params: { "_": p.slice(1) }
		};
	});
})();
var globalMiddleware = [toEventHandler(static_default)].filter(Boolean);
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/prod.mjs
var errorHandler = (error, event) => {
	const res = defaultHandler(error, event);
	return new NodeResponse(typeof res.body === "string" ? res.body : JSON.stringify(res.body, null, 2), res);
};
function defaultHandler(error, event) {
	const unhandled = error.unhandled ?? !HTTPError.isError(error);
	const { status = 500, statusText = "" } = unhandled ? {} : error;
	if (status === 404) {
		const url = event.url || new URL(event.req.url);
		const baseURL = "/";
		if (/^\/[^/]/.test(baseURL) && !url.pathname.startsWith(baseURL)) return {
			status: 302,
			headers: new Headers({ location: `${baseURL}${url.pathname.slice(1)}${url.search}` })
		};
	}
	const headers = new Headers(unhandled ? {} : error.headers);
	headers.set("content-type", "application/json; charset=utf-8");
	return {
		status,
		statusText,
		headers,
		body: {
			error: true,
			...unhandled ? {
				status,
				unhandled: true
			} : typeof error.toJSON === "function" ? error.toJSON() : {
				status,
				statusText,
				message: error.message
			}
		}
	};
}
//#endregion
//#region #nitro/virtual/error-handler
var errorHandlers = [errorHandler];
async function error_handler_default(error, event) {
	for (const handler of errorHandlers) try {
		const response = await handler(error, event, { defaultHandler });
		if (response) return response;
	} catch (error) {
		console.error(error);
	}
}
//#endregion
//#region #nitro/virtual/app
function createNitroApp() {
	const captureError = (error, errorCtx) => {
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) errors.push({
				error,
				context: errorCtx
			});
		}
	};
	const h3App = createH3App({ onError(error, event) {
		return error_handler_default(error, event);
	} });
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	return {
		fetch: appHandler,
		h3: h3App,
		hooks: void 0,
		captureError
	};
}
function createH3App(config) {
	const h3App = new H3Core(config);
	h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname);
	h3App["~middleware"].push(...globalMiddleware);
	h3App["~getMiddleware"] = (event, route) => {
		const pathname = event.url.pathname;
		const method = event.req.method;
		const middleware = [];
		const routeRules = getRouteRules(method, pathname);
		event.context.routeRules = routeRules?.routeRules;
		if (routeRules?.routeRuleMiddleware.length) middleware.push(...routeRules.routeRuleMiddleware);
		middleware.push(...h3App["~middleware"]);
		if (route?.data?.middleware?.length) middleware.push(...route.data.middleware);
		return middleware;
	};
	return h3App;
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/app.mjs
var APP_ID = "default";
function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) return instance;
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	return instance;
}
function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) return { routeRuleMiddleware: [] };
	const routeRules = {};
	for (const layer of m) for (const rule of layer.data) {
		const currentRule = routeRules[rule.name];
		if (currentRule) {
			if (rule.options === false) {
				delete routeRules[rule.name];
				continue;
			}
			if (typeof currentRule.options === "object" && typeof rule.options === "object") currentRule.options = {
				...currentRule.options,
				...rule.options
			};
			else currentRule.options = rule.options;
			currentRule.route = rule.route;
			currentRule.params = {
				...currentRule.params,
				...layer.params
			};
		} else if (rule.options !== false) routeRules[rule.name] = {
			...rule,
			params: layer.params
		};
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) continue;
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
//#endregion
//#region node_modules/nitro/dist/runtime/internal/error/hooks.mjs
function _captureError(error, type) {
	console.error(`[${type}]`, error);
	useNitroApp().captureError?.(error, { tags: [type] });
}
function trapUnhandledErrors() {
	process.on("unhandledRejection", (error) => _captureError(error, "unhandledRejection"));
	process.on("uncaughtException", (error) => _captureError(error, "uncaughtException"));
}
//#endregion
//#region #nitro/virtual/tracing
var tracingSrvxPlugins = [];
//#endregion
//#region node_modules/nitro/dist/presets/node/runtime/node-server.mjs
var _parsedPort = Number.parseInt(process.env.NITRO_PORT ?? process.env.PORT ?? "");
var port = Number.isNaN(_parsedPort) ? 3e3 : _parsedPort;
var host = process.env.NITRO_HOST || process.env.HOST;
var cert = process.env.NITRO_SSL_CERT;
var key = process.env.NITRO_SSL_KEY;
var nitroApp = useNitroApp();
serve({
	port,
	hostname: host,
	tls: cert && key ? {
		cert,
		key
	} : void 0,
	fetch: nitroApp.fetch,
	plugins: [...tracingSrvxPlugins]
});
trapUnhandledErrors();
var node_server_default = {};
//#endregion
export { node_server_default as default };
