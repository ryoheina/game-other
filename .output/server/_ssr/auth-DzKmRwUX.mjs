import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as MouseGlow, r as Particles } from "./fx-CW4x6DdP.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DzKmRwUX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Auth() {
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [err, setErr] = (0, import_react.useState)(null);
	const [info, setInfo] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let mounted = true;
		(async () => {
			try {
				if ((await fetch("/api/admin/dashboard", { credentials: "include" })).ok && mounted) navigate({
					to: "/admin",
					replace: true
				});
			} catch {}
		})();
		return () => {
			mounted = false;
		};
	}, [navigate]);
	const onSubmit = async (e) => {
		e.preventDefault();
		setBusy(true);
		setErr(null);
		try {
			if (!password) throw new Error("Password is required.");
			const res = await fetch("/api/admin/login", {
				method: "POST",
				credentials: "include",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ password })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => null);
				throw new Error(body?.error || "Invalid password.");
			}
			navigate({
				to: "/admin",
				replace: true
			});
		} catch (e) {
			setErr(e instanceof Error ? e.message : "Unable to authenticate.");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MouseGlow, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Particles, {
				count: 30,
				color: "arcane"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_30%,oklch(0.72_0.19_245/0.18),transparent)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full max-w-md rounded-2xl glass p-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "mb-6 inline-block text-xs uppercase tracking-[0.35em] text-white/50 hover:text-white",
						children: "← Back to site"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "display text-3xl text-white",
						children: "Studio Login"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-white/60",
						children: "Enter the admin password to access your studio dashboard."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit,
						className: "mt-8 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "password",
								required: true,
								autoComplete: "current-password",
								value: password,
								onChange: (e) => setPassword(e.target.value),
								placeholder: "Admin password",
								className: "w-full rounded-xl bg-white/5 px-4 py-3 text-white placeholder-white/40 outline-none ring-1 ring-white/10 focus:ring-[color:var(--arcane)]"
							}),
							err && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm text-[color:var(--ember)]",
								children: err
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: busy,
								className: "w-full rounded-full bg-gradient-to-r from-[color:var(--arcane)] to-[color:var(--gold)] px-6 py-3 text-sm uppercase tracking-[0.25em] text-black transition hover:scale-[1.01] disabled:opacity-60",
								children: busy ? "…" : "Enter"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 text-center text-xs text-white/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Enter your admin password to access the studio dashboard." })
					})
				]
			})
		]
	});
}
//#endregion
export { Auth as component };
