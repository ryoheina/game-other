//#region node_modules/.nitro/vite/services/ssr/assets/visitor-session-CAw0UShx.js
var fallbackSessionId = "";
function ensureVisitorSession() {
	if (typeof window === "undefined") return "";
	const key = "loe_sid";
	try {
		let sid = window.localStorage.getItem(key);
		if (!sid) {
			sid = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
			window.localStorage.setItem(key, sid);
		}
		return sid;
	} catch {
		if (!fallbackSessionId) fallbackSessionId = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
		return fallbackSessionId;
	}
}
//#endregion
export { ensureVisitorSession as t };
