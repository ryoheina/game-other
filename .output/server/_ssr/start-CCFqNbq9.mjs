import { n as createStart, t as createMiddleware } from "./createStart-Dt05N14y.mjs";
import { t as renderErrorPage } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/start-CCFqNbq9.js
var attachSupabaseAuth = createMiddleware({ type: "function" }).client(async ({ next }) => {
	if (!Boolean("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0bWl0ZGt0b21nbmJ1aGhkc2F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNzQyMjEsImV4cCI6MjA5ODg1MDIyMX0.YPfKml6BGe-26KNd8Segf_IdYmACP11BmrnM-mm8liI")) return next();
	try {
		const { supabase } = await import("./client-DtboJvde.mjs");
		const { data } = await supabase.auth.getSession();
		const token = data.session?.access_token;
		return next({ headers: token ? { Authorization: `Bearer ${token}` } : {} });
	} catch (error) {
		console.warn("[Supabase] Auth header skipped:", error);
		return next();
	}
});
var errorMiddleware = createMiddleware().server(async ({ next }) => {
	try {
		return await next();
	} catch (error) {
		if (error != null && typeof error === "object" && "statusCode" in error) throw error;
		console.error(error);
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
});
var startInstance = createStart(() => ({
	functionMiddleware: [attachSupabaseAuth],
	requestMiddleware: [errorMiddleware]
}));
//#endregion
export { startInstance };
