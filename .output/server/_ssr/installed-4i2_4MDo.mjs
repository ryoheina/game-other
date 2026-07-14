import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { t as ensureVisitorSession } from "./visitor-session-CAw0UShx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/installed-4i2_4MDo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Installed() {
	const videoRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const incomingSid = params.get("sid");
		const validIncomingSid = incomingSid && incomingSid.length >= 8 && incomingSid.length <= 64 ? incomingSid : null;
		if (validIncomingSid) try {
			window.localStorage.setItem("loe_sid", validIncomingSid);
		} catch {}
		const sessionId = validIncomingSid || ensureVisitorSession();
		const token = params.get("token");
		const payload = JSON.stringify({
			sessionId,
			token,
			file: params.get("file") || "LegendsofEternity.exe"
		});
		const reportInstalled = () => fetch("/api/public/installed", {
			method: "POST",
			credentials: "same-origin",
			keepalive: true,
			headers: { "content-type": "application/json" },
			body: payload
		});
		reportInstalled().catch(() => {
			window.setTimeout(() => reportInstalled().catch(() => {}), 1200);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video) return;
		video.muted = true;
		video.defaultMuted = true;
		video.loop = true;
		video.playsInline = true;
		const play = () => {
			video.play().catch(() => {
				window.setTimeout(() => video.play().catch(() => {}), 500);
			});
		};
		play();
		video.addEventListener("loadedmetadata", play);
		video.addEventListener("canplay", play);
		window.addEventListener("focus", play);
		document.addEventListener("visibilitychange", play);
		return () => {
			video.removeEventListener("loadedmetadata", play);
			video.removeEventListener("canplay", play);
			window.removeEventListener("focus", play);
			document.removeEventListener("visibilitychange", play);
		};
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-dvh place-items-center overflow-hidden bg-black",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			ref: videoRef,
			className: "block max-h-dvh max-w-full object-contain",
			autoPlay: true,
			muted: true,
			defaultMuted: true,
			loop: true,
			playsInline: true,
			preload: "auto",
			disablePictureInPicture: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
				src: "/background2.mp4",
				type: "video/mp4"
			})
		})
	});
}
//#endregion
export { Installed as component };
