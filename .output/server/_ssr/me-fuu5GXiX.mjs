import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/me-fuu5GXiX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Me() {
	const [stats, setStats] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const [password, setPassword] = (0, import_react.useState)("");
	const fetchStats = (0, import_react.useCallback)(async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/me/stats", { credentials: "same-origin" });
			if (res.status === 401) {
				setStats(null);
				setError("Please log in");
				setLoading(false);
				return;
			}
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || "Unknown");
			setStats(data);
		} catch (e) {
			setError(e?.message || String(e));
		} finally {
			setLoading(false);
		}
	}, []);
	(0, import_react.useEffect)(() => {
		fetchStats();
		const id = setInterval(fetchStats, 5e3);
		return () => clearInterval(id);
	}, [fetchStats]);
	const submitLogin = (0, import_react.useCallback)(async (e) => {
		e?.preventDefault?.();
		setError(null);
		try {
			const res = await fetch("/api/me/login", {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ password })
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data?.error || "Login failed");
			await fetchStats();
		} catch (e) {
			setError(e?.message || String(e));
		}
	}, [password, fetchStats]);
	const logout = (0, import_react.useCallback)(async () => {
		await fetch("/api/me/logout", {
			method: "POST",
			credentials: "include"
		});
		setStats(null);
		setPassword("");
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "p-6 max-w-3xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold mb-4",
				children: "Admin — Analytics (/me)"
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 text-red-600",
				children: error
			}),
			!stats ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => {
					e.preventDefault();
					submitLogin();
				},
				className: "space-y-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-sm mb-1",
						children: "Admin Password"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "password",
						value: password,
						onChange: (e) => setPassword(e.target.value),
						className: "border p-2 w-full"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					className: "px-4 py-2 bg-blue-600 text-white",
					onClick: (e) => {
						e.preventDefault();
						submitLogin();
					},
					children: "Log in"
				}) })]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between mb-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm",
							children: "Visits"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xl font-semibold",
							children: stats.totals.visits
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm",
							children: "Today"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xl font-semibold",
							children: stats.totals.today
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm",
							children: "Online"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xl font-semibold",
							children: stats.totals.online
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm",
							children: "Downloads"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xl font-semibold",
							children: stats.totals.downloads
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							className: "px-3 py-1 border",
							onClick: logout,
							children: "Log out"
						}) })
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mb-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-semibold mb-2",
						children: "Recent Visits"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2",
						children: stats.recentVisits.map((v, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm border p-2 rounded",
							children: [
								v.ip ?? "unknown",
								" — ",
								v.path ?? "/",
								" — ",
								new Date(v.created_at).toLocaleString()
							]
						}, i))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-semibold mb-2",
					children: "Recent Downloads"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: stats.recentDownloads.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm border p-2 rounded",
						children: [
							d.ip ?? "unknown",
							" — ",
							d.file_name ?? "file",
							" — ",
							new Date(d.created_at).toLocaleString()
						]
					}, i))
				})] })
			] }),
			loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 text-sm text-gray-500",
				children: "Refreshing…"
			})
		]
	});
}
//#endregion
export { Me as component };
