import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as MouseGlow } from "./fx-CW4x6DdP.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BCl84pEa.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function useAdminNotifications(initial = []) {
	const [notifications, setNotifications] = (0, import_react.useState)(initial);
	const mountedRef = (0, import_react.useRef)(true);
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		async function poll() {
			try {
				const res = await fetch("/api/admin/dashboard", { credentials: "include" });
				if (!res.ok) return;
				const data = await res.json();
				if (!mountedRef.current) return;
				setNotifications(data.notifications || []);
			} catch {}
		}
		poll();
		const iv = setInterval(poll, 3e3);
		return () => {
			mountedRef.current = false;
			clearInterval(iv);
		};
	}, []);
	const markRead = async (id) => {
		try {
			if ((await fetch("/api/admin/mark-notification-read", {
				method: "POST",
				credentials: "include",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ id })
			})).ok) setNotifications((prev) => prev.map((n) => n.id === id ? {
				...n,
				read: true
			} : n));
		} catch (e) {}
	};
	const remove = async (id) => {
		try {
			if ((await fetch("/api/admin/delete-notification", {
				method: "POST",
				credentials: "include",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ id })
			})).ok) setNotifications((prev) => prev.filter((n) => n.id !== id));
		} catch (e) {}
	};
	const clearAll = async () => {
		try {
			if ((await fetch("/api/admin/clear-notifications", {
				method: "POST",
				credentials: "include"
			})).ok) setNotifications([]);
		} catch (e) {}
	};
	return {
		notifications,
		setNotifications,
		markRead,
		remove,
		clearAll
	};
}
/**
* Enhanced desktop notification hook with Realtime subscription + polling fallback.
* Captures full event details (IP, country, device, browser, filename).
* Stores notifications in Supabase notifications table.
* Shows rich browser desktop notifications automatically.
* Prevents duplicates by tracking shown notification IDs.
*/
function useDesktopNotifications() {
	const [notificationState, setNotificationState] = (0, import_react.useState)({
		permission: "default",
		notificationCount: 0,
		lastError: null
	});
	const shownNotificationIdsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const pollingIntervalRef = (0, import_react.useRef)(null);
	const mountedRef = (0, import_react.useRef)(true);
	async function showStoredNotification(note) {
		const notifId = String(note.id || `${note.type}-${note.session_id}-${note.created_at}`);
		if (shownNotificationIdsRef.current.has(notifId)) return;
		shownNotificationIdsRef.current.add(notifId);
		const isVisitor = note.type_detail === "visitor" || note.payload?.type_detail === "visitor" || note.type === "visitor" || note.type === "visitor_arrival" || note.type === "visitor_left";
		const title = note.title || (isVisitor ? "Visitor Activity" : "Download Activity");
		const body = note.body || [
			note.session_id ? `Session: ${String(note.session_id).slice(0, 8)}` : null,
			`IP: ${note.ip_address || note.payload?.ip_address || "unknown"}`,
			`Country: ${note.country || note.payload?.country || "unknown"}`,
			note.device || note.payload?.device ? `Device: ${note.device || note.payload?.device}` : null,
			note.browser || note.payload?.browser ? `Browser: ${note.browser || note.payload?.browser}` : null,
			note.filename || note.payload?.filename ? `File: ${note.filename || note.payload?.filename}` : null
		].filter(Boolean).join("\n");
		try {
			if (typeof Notification !== "undefined" && Notification.permission === "granted") try {
				const notif = new Notification(title, {
					body,
					icon: "/favicon.ico",
					tag: notifId,
					badge: "/favicon.ico"
				});
				console.log("[Desktop Notifications] Browser notification sent:", {
					title,
					body
				});
				notif.onclick = () => {
					try {
						window.focus();
						window.location.href = "/admin";
					} catch (e) {
						console.error("[Desktop Notifications] Focus failed:", e);
					}
				};
				setNotificationState((prev) => ({
					...prev,
					notificationCount: prev.notificationCount + 1
				}));
			} catch (err) {
				console.error("[Desktop Notifications] Browser notification failed:", err);
				setNotificationState((prev) => ({
					...prev,
					lastError: `Browser notification failed: ${String(err)}`
				}));
			}
		} catch (err) {
			console.error("[Desktop Notifications] Unexpected error in showNotification:", err);
		}
	}
	(0, import_react.useEffect)(() => {
		mountedRef.current = true;
		if (typeof Notification === "undefined") {
			console.warn("[Desktop Notifications] Browser does not support Notifications API");
			setNotificationState((prev) => ({
				...prev,
				permission: "denied",
				lastError: "Browser does not support notifications"
			}));
			return;
		}
		const currentPermission = Notification.permission;
		setNotificationState((prev) => ({
			...prev,
			permission: currentPermission
		}));
		console.log("[Desktop Notifications] Notification permission:", currentPermission);
		if (currentPermission === "default") {
			console.log("[Desktop Notifications] Requesting notification permission...");
			setNotificationState((prev) => ({
				...prev,
				permission: "loading"
			}));
			Notification.requestPermission().then((permission) => {
				if (!mountedRef.current) return;
				console.log("[Desktop Notifications] Notification permission:", permission);
				setNotificationState((prev) => ({
					...prev,
					permission,
					lastError: permission === "denied" ? "Notifications denied by user" : null
				}));
			}).catch((err) => {
				if (!mountedRef.current) return;
				console.error("[Desktop Notifications] Permission request failed:", err);
				setNotificationState((prev) => ({
					...prev,
					permission: "denied",
					lastError: `Permission error: ${String(err)}`
				}));
			});
		} else if (currentPermission === "denied") setNotificationState((prev) => ({
			...prev,
			lastError: "Notifications denied by user or browser policy"
		}));
		return () => {
			mountedRef.current = false;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!mountedRef.current || notificationState.permission !== "granted") return;
		async function pollDashboard() {
			if (!mountedRef.current) return;
			try {
				const res = await fetch("/api/admin/dashboard", { credentials: "include" });
				if (!res.ok || res.status === 401) return;
				const data = await res.json();
				if (!mountedRef.current) return;
				(data.notifications || []).filter((note) => note.read !== true).slice().reverse().forEach((note) => {
					showStoredNotification(note);
				});
			} catch (err) {
				console.error("[Desktop Notifications] Polling error:", err);
			}
		}
		pollDashboard();
		pollingIntervalRef.current = setInterval(pollDashboard, 2500);
		return () => {
			if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
		};
	}, [notificationState.permission]);
	return notificationState;
}
var KNOWN_GAME_FILE_SIZE = 134015488;
function formatDownloadBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes <= 0) return "0 MB";
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
function formatDownloadTime(seconds) {
	if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
	const whole = Math.round(seconds);
	const minutes = Math.floor(whole / 60);
	const rest = whole % 60;
	return minutes > 0 ? `${minutes}m ${String(rest).padStart(2, "0")}s` : `${rest}s`;
}
function Admin() {
	const navigate = useNavigate();
	const [authorized, setAuthorized] = (0, import_react.useState)(void 0);
	const [sessions, setSessions] = (0, import_react.useState)([]);
	const [sessionsPage, setSessionsPage] = (0, import_react.useState)(1);
	const [downloads, setDownloads] = (0, import_react.useState)([]);
	const [networkClusters, setNetworkClusters] = (0, import_react.useState)([]);
	const [stats, setStats] = (0, import_react.useState)(null);
	const [latestAlert, setLatestAlert] = (0, import_react.useState)(null);
	const { notifications, setNotifications, markRead, remove, clearAll } = useAdminNotifications([]);
	const desktopNotifState = useDesktopNotifications();
	const lastSnapshotRef = (0, import_react.useRef)(null);
	const shownInPageNotificationIdsRef = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	(0, import_react.useEffect)(() => {
		let mounted = true;
		(async () => {
			try {
				const res = await fetch("/api/admin/dashboard", { credentials: "include" });
				if (res.status === 401) {
					navigate({
						to: "/auth",
						replace: true
					});
					return;
				}
				if (res.ok && mounted) setAuthorized(true);
			} catch {
				navigate({
					to: "/auth",
					replace: true
				});
			}
		})();
		return () => {
			mounted = false;
		};
	}, [navigate]);
	(0, import_react.useEffect)(() => {
		if (!authorized) return;
		if (typeof Notification !== "undefined" && Notification.permission === "default") Notification.requestPermission().catch(() => {});
		let mounted = true;
		let pollIv = null;
		async function fetchDashboard() {
			try {
				const res = await fetch("/api/admin/dashboard", {
					credentials: "include",
					headers: { "content-type": "application/json" }
				});
				if (res.status === 401) {
					navigate({
						to: "/auth",
						replace: true
					});
					return false;
				}
				if (!res.ok) {
					console.error("Dashboard API error:", res.status, res.statusText);
					if (!mounted) return true;
					setSessions([]);
					setDownloads([]);
					setNetworkClusters([]);
					setStats(null);
					setNotifications([]);
					return true;
				}
				const data = await res.json();
				if (!mounted) return true;
				setSessions(data.sessions || []);
				setDownloads(data.downloads || []);
				setNetworkClusters(data.networkClusters || []);
				setStats(data.stats || null);
				const nextNotifications = data.notifications || [];
				setNotifications(nextNotifications);
				const newestUnread = nextNotifications.find((note) => note.read !== true && !shownInPageNotificationIdsRef.current.has(String(note.id)));
				if (newestUnread) {
					shownInPageNotificationIdsRef.current.add(String(newestUnread.id));
					setLatestAlert(newestUnread);
					window.setTimeout(() => {
						setLatestAlert((current) => current?.id === newestUnread.id ? null : current);
					}, 8e3);
				}
				const snap = JSON.stringify((data.sessions || []).map((item) => ({
					id: item.session_id,
					last_active: item.last_active
				})));
				if (lastSnapshotRef.current && lastSnapshotRef.current !== snap) {
					const prev = JSON.parse(lastSnapshotRef.current);
					const prevMap = new Map(prev.map((p) => [p.id, p.last_active]));
					(data.sessions || []).forEach((item) => {
						const prevVal = prevMap.get(item.session_id);
						if (prevVal && prevVal !== item.last_active && typeof Notification !== "undefined" && Notification.permission === "granted") new Notification("Visitor activity", { body: `${item.ip ?? "unknown"} — ${item.device ?? item.os} — ${item.status}` });
					});
				}
				lastSnapshotRef.current = snap;
				return true;
			} catch (e) {
				console.error("Dashboard poll error:", e);
				if (!mounted) return false;
				setSessions([]);
				setDownloads([]);
				setNetworkClusters([]);
				setStats(null);
				setNotifications([]);
				return false;
			}
		}
		fetchDashboard();
		pollIv = setInterval(fetchDashboard, 3e3);
		return () => {
			mounted = false;
			if (pollIv) clearInterval(pollIv);
		};
	}, [authorized, navigate]);
	const signOut = async () => {
		await fetch("/api/admin/logout", {
			method: "POST",
			credentials: "include"
		}).catch(() => {});
		navigate({
			to: "/auth",
			replace: true
		});
	};
	const clearAllHistory = async () => {
		if (!window.confirm("Clear all visitor, download, extraction, and notification history? This cannot be undone.")) return;
		try {
			const res = await fetch("/api/admin/clear-history", {
				method: "POST",
				credentials: "include"
			});
			const body = await res.json().catch(() => null);
			if (!res.ok) {
				window.alert("Clear history failed: " + (body?.error || res.statusText));
				return;
			}
			setSessions([]);
			setDownloads([]);
			setNetworkClusters([]);
			setStats(null);
			setNotifications([]);
			setSessionsPage(1);
			window.alert("All history cleared");
		} catch (error) {
			window.alert("Clear history failed: " + String(error));
		}
	};
	const sessionsPerPage = 10;
	const totalSessionPages = Math.max(1, Math.ceil(sessions.length / sessionsPerPage));
	const currentSessionPage = Math.min(sessionsPage, totalSessionPages);
	const paginatedSessions = sessions.slice((currentSessionPage - 1) * sessionsPerPage, currentSessionPage * sessionsPerPage);
	(0, import_react.useEffect)(() => {
		setSessionsPage((page) => Math.min(page, Math.max(1, Math.ceil(sessions.length / sessionsPerPage))));
	}, [sessions.length]);
	if (authorized === void 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-dvh place-items-center text-white/60",
		children: "Loading admin…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-dvh bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MouseGlow, {}),
			latestAlert && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "fixed right-4 top-20 z-50 w-[min(24rem,calc(100vw-2rem))] rounded-2xl border border-[color:var(--gold)]/40 bg-black/85 p-4 text-white shadow-[0_0_50px_rgba(255,214,120,0.22)] backdrop-blur-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-[10px] uppercase tracking-[0.28em] text-[color:var(--gold)]",
						children: "New notification"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 font-semibold",
						children: latestAlert.title || "Activity detected"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-1 text-sm text-white/70",
						children: latestAlert.body || latestAlert.filename || latestAlert.type || "New admin event"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setLatestAlert(null),
						className: "mt-3 text-xs uppercase tracking-widest text-white/50 hover:text-white",
						children: "Dismiss"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "sticky top-0 z-30 border-b border-white/5 bg-background/70 backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-7xl items-center justify-between px-6 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-8 w-8 place-items-center rounded-md glass glow-blue",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "display text-gradient-gold text-sm",
									children: "L"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "display text-xs tracking-[0.35em] text-white/80",
								children: "STUDIO CONSOLE"
							}),
							desktopNotifState.permission === "granted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 ml-4 text-xs text-emerald-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-2 rounded-full bg-emerald-400 animate-pulse" }), "Notifications active"]
							}),
							desktopNotifState.permission === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 ml-4 text-xs text-red-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-2 rounded-full bg-red-400" }), "Notifications denied"]
							}),
							desktopNotifState.permission === "default" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-1 ml-4 text-xs text-yellow-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-2 w-2 rounded-full bg-yellow-400" }), "Notifications: not granted"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "rounded-full px-4 py-2 text-xs uppercase tracking-widest text-white/60 hover:text-white",
							children: "View site"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: signOut,
							className: "rounded-full glass px-4 py-2 text-xs uppercase tracking-widest text-white/80 hover:text-white",
							children: "Sign out"
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto max-w-5xl space-y-6 p-6",
				children: [
					desktopNotifState.permission === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "rounded-3xl glass p-6 border border-red-400/30 bg-red-950/20 text-red-200",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-lg",
								children: "⚠️"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-semibold",
									children: "Notifications Disabled"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-red-200/80",
									children: "Browser notifications have been denied. Check your browser settings to enable notifications for this site. You will receive real-time alerts for new visitors and downloads once enabled."
								}),
								desktopNotifState.lastError && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-xs text-red-300 font-mono bg-black/30 p-2 rounded",
									children: desktopNotifState.lastError
								})
							] })]
						})
					}),
					desktopNotifState.permission === "loading" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "rounded-3xl glass p-6 border border-blue-400/30 bg-blue-950/20 text-blue-200",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "animate-spin text-lg",
								children: "⏳"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm",
								children: "Requesting notification permission..."
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl glass p-8 text-white",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "display text-3xl",
							children: "Studio Admin Dashboard"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-white/70",
							children: "You are signed in using a signed, expiring admin cookie. All admin data APIs require that cookie."
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
						className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
						children: [
							["Visitors", stats?.total_sessions ?? sessions.length],
							["Online", stats?.online_sessions ?? sessions.filter((s) => s.status === "online").length],
							["Download users", stats?.download_users ?? new Set(downloads.map((d) => d.session_id || d.ip || d.user_id).filter(Boolean)).size],
							["Downloads", stats?.total_downloads ?? downloads.length]
						].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl glass p-5 text-white",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[10px] uppercase tracking-[0.3em] text-white/40",
								children: label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 text-3xl font-semibold",
								children: value
							})]
						}, label))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "rounded-3xl glass p-8 text-white",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-xl font-semibold",
								children: "Admin tools"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-sm text-white/70",
								children: [
									"This admin page is available at ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "rounded bg-white/5 px-2 py-1",
										children: "/admin"
									}),
									"."
								]
							}),
							desktopNotifState.permission === "granted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 text-xs text-emerald-300",
								children: ["✓ Desktop notifications enabled. You will receive real-time alerts for new visitors and downloads.", desktopNotifState.notificationCount > 0 && ` (${desktopNotifState.notificationCount} notifications sent)`]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									onClick: clearAllHistory,
									className: "rounded-full border border-red-400/40 bg-red-950/30 px-4 py-2 text-xs uppercase tracking-widest text-red-200 hover:bg-red-900/40",
									children: "Clear all history"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 space-y-8",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "overflow-x-auto rounded-3xl bg-white/5 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-lg font-medium",
												children: "Active visitors"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2 text-xs text-white/60",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														disabled: currentSessionPage <= 1,
														onClick: () => setSessionsPage((page) => Math.max(1, page - 1)),
														className: "rounded-full glass px-3 py-1 disabled:opacity-40",
														children: "Previous"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
														"Page ",
														currentSessionPage,
														" of ",
														totalSessionPages
													] }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														disabled: currentSessionPage >= totalSessionPages,
														onClick: () => setSessionsPage((page) => Math.min(totalSessionPages, page + 1)),
														className: "rounded-full glass px-3 py-1 disabled:opacity-40",
														children: "Next"
													})
												]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full table-auto text-left text-sm text-white/80",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Session"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "IP"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Country"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Device"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Browser"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "OS"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Install"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Status"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Status reason"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Last active"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "First visit"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Actions"
												})
											] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: paginatedSessions.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-t border-white/5 text-white/70",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: d.session_id.slice(0, 8)
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: d.ip ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: d.country ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: d.device ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: d.browser ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: d.os ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: `rounded-full px-2 py-1 text-xs font-semibold ${d.installed ? "bg-blue-500/15 text-blue-300" : "bg-red-500/15 text-red-300"}`,
															children: d.installed ? "installed" : "non"
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: `rounded-full px-2 py-1 text-xs ${d.status === "online" ? "bg-emerald-500/15 text-emerald-300" : "bg-white/5 text-white/50"}`,
															children: d.status
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "max-w-[220px] px-2 py-2 text-xs text-white/50",
														children: d.status_reason ?? "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: new Date(d.last_active).toLocaleTimeString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: new Date(d.first_visit).toLocaleTimeString()
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex gap-2",
															children: [d.user_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: async () => {
																	if (!window.confirm("Delete user and associated data?")) return;
																	try {
																		const res = await fetch("/api/admin/delete-user", {
																			method: "POST",
																			credentials: "include",
																			headers: { "content-type": "application/json" },
																			body: JSON.stringify({ user_id: d.user_id })
																		});
																		if (!res.ok) {
																			const b = await res.json().catch(() => null);
																			window.alert("Delete failed: " + (b?.error || res.statusText));
																		} else {
																			window.alert("User deleted");
																			setSessions((prev) => prev.filter((s) => s.user_id !== d.user_id));
																			setDownloads((prev) => prev.filter((x) => x.user_id !== d.user_id));
																		}
																	} catch (e) {
																		window.alert("Delete failed: " + String(e));
																	}
																},
																className: "text-xs text-red-400 hover:text-red-300",
																children: "Delete user"
															}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																onClick: async () => {
																	if (!window.confirm("Delete this session?")) return;
																	try {
																		const res = await fetch("/api/admin/delete-session", {
																			method: "POST",
																			credentials: "include",
																			headers: { "content-type": "application/json" },
																			body: JSON.stringify({ id: d.session_id })
																		});
																		if (!res.ok) {
																			const b = await res.json().catch(() => null);
																			window.alert("Delete session failed: " + (b?.error || res.statusText));
																		} else setSessions((prev) => prev.filter((s) => s.session_id !== d.session_id));
																	} catch (e) {
																		window.alert("Delete session failed: " + String(e));
																	}
																},
																className: "text-xs text-white/60 hover:text-white",
																children: "Delete session"
															})]
														})
													})
												]
											}, d.session_id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "overflow-x-auto rounded-3xl bg-white/5 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-lg font-medium",
												children: "Network behavior clusters"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 max-w-2xl text-xs text-white/50",
												children: "Groups are based on /24 subnet, ASN when available, country, city when available, and a 1-hour time window. This does not identify a person."
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-xs uppercase tracking-[0.22em] text-white/40",
												children: [
													networkClusters.length,
													" cluster",
													networkClusters.length === 1 ? "" : "s"
												]
											})]
										}), networkClusters.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/50",
											children: "No possible related VPN/network activity detected."
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "mt-4 w-full table-auto text-left text-sm text-white/80",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Network cluster"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Safe label"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Subnet"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "ASN"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Country"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "City"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Time range"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-2 py-2",
													children: "Confidence"
												})
											] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: networkClusters.map((cluster) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "border-t border-white/5 text-white/70",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2 font-mono text-xs",
														children: cluster.network_cluster_id
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "max-w-md px-2 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "rounded-2xl border border-blue-400/20 bg-blue-500/10 px-3 py-2 text-blue-100",
															children: cluster.safe_label || `Possible related VPN/network activity: [${(cluster.ip_list || []).join(", ")}]`
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2 font-mono text-xs",
														children: cluster.subnet_24 || "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: cluster.asn && cluster.asn !== "unknown" ? cluster.asn : "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: cluster.country && cluster.country !== "unknown" ? cluster.country : "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: cluster.city && cluster.city !== "unknown" ? cluster.city : "—"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-2 py-2 whitespace-nowrap",
														children: [
															cluster.first_seen ? new Date(cluster.first_seen).toLocaleTimeString() : "—",
															" - ",
															cluster.last_seen ? new Date(cluster.last_seen).toLocaleTimeString() : "—"
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-2 py-2",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "rounded-full bg-white/10 px-2 py-1 text-xs text-white/70",
															children: [cluster.cluster_confidence ?? 0, "%"]
														})
													})
												]
											}, cluster.network_cluster_id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "overflow-x-auto rounded-3xl bg-white/5 p-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-lg font-medium",
												children: "Download activity"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex justify-end mt-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: async () => {
														if (!window.confirm("Clear all download history? This cannot be undone.")) return;
														try {
															const res = await fetch("/api/admin/clear-downloads", {
																method: "POST",
																credentials: "include"
															});
															if (!res.ok) {
																const b = await res.json().catch(() => null);
																window.alert("Clear failed: " + (b?.error || res.statusText));
															} else {
																setDownloads([]);
																window.alert("Downloads cleared");
															}
														} catch (e) {
															window.alert("Clear failed: " + String(e));
														}
													},
													className: "text-xs text-white/60 hover:text-white",
													children: "Clear downloads"
												})
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
												className: "w-full table-auto text-left text-sm text-white/80",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-2 py-2",
														children: "Time"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-2 py-2",
														children: "IP"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-2 py-2",
														children: "Session"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-2 py-2",
														children: "File"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-2 py-2",
														children: "Status"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-2 py-2",
														children: "Progress"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-2 py-2",
														children: "Install"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
														className: "px-2 py-2",
														children: "Completed"
													})
												] }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: downloads.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													className: "border-t border-white/5 text-white/70",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: new Date(d.started_at ?? d.created_at).toLocaleString()
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: d.ip ?? "—"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: d.session_id ? d.session_id.slice(0, 8) : "—"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: d.file_name
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: d.status
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "min-w-[260px] px-2 py-2",
															children: (() => {
																const downloadedBytes = Number(d.downloaded_bytes || 0);
																const totalBytes = Number(d.total_bytes || 0) || (d.file_name === "LegendsofEternity.exe" ? KNOWN_GAME_FILE_SIZE : 0);
																const storedPercent = Number(d.progress_percent || 0);
																const bytePercent = totalBytes > 0 && downloadedBytes > 0 ? Math.round(downloadedBytes / totalBytes * 100) : 0;
																const elapsedSeconds = Number(d.elapsed_seconds || 0);
																const complete = d.completed === true && (downloadedBytes > 0 || storedPercent > 0 || elapsedSeconds > 0 || Boolean(d.completed_at));
																const percent = complete ? 100 : Math.max(0, Math.min(99, storedPercent || bytePercent));
																return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																	className: "rounded-2xl border border-white/10 bg-black/25 p-3",
																	children: [
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																			className: "mb-2 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[0.18em] text-white/55",
																			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: complete ? "Complete" : `${percent}%` }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDownloadTime(elapsedSeconds) })]
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																			className: "h-2 overflow-hidden rounded-full bg-white/10",
																			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																				className: "h-full rounded-full bg-gradient-to-r from-[#75d6ff] via-[#ffe08a] to-[#ff8f70] shadow-[0_0_18px_rgba(255,224,138,0.45)] transition-all duration-300",
																				style: { width: `${percent}%` }
																			})
																		}),
																		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																			className: "mt-2 flex items-center justify-between gap-3 text-[11px] text-white/45",
																			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDownloadBytes(downloadedBytes) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: totalBytes > 0 ? formatDownloadBytes(totalBytes) : "Calculating size" })]
																		})
																	]
																});
															})()
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: `rounded-full px-2 py-1 text-xs font-semibold ${d.installed ? "bg-blue-500/15 text-blue-300" : "bg-red-500/15 text-red-300"}`,
																children: d.installed ? "installed" : "non"
															})
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: d.completed === true && (Number(d.downloaded_bytes || 0) > 0 || Number(d.progress_percent || 0) > 0 || Number(d.elapsed_seconds || 0) > 0 || Boolean(d.completed_at)) ? "Yes" : "No"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-2 py-2",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex gap-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																	onClick: async () => {
																		if (!window.confirm("Delete this download record?")) return;
																		try {
																			const res = await fetch("/api/admin/delete-download", {
																				method: "POST",
																				credentials: "include",
																				headers: { "content-type": "application/json" },
																				body: JSON.stringify({ id: d.id })
																			});
																			if (!res.ok) {
																				const b = await res.json().catch(() => null);
																				window.alert("Delete failed: " + (b?.error || res.statusText));
																			} else setDownloads((prev) => prev.filter((x) => x.id !== d.id));
																		} catch (e) {
																			window.alert("Delete failed: " + String(e));
																		}
																	},
																	className: "text-xs text-white/60 hover:text-white",
																	children: "Delete"
																}), d.user_id ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																	onClick: async () => {
																		if (!window.confirm("Delete user and associated records? This cannot be undone.")) return;
																		try {
																			const res = await fetch("/api/admin/delete-user", {
																				method: "POST",
																				credentials: "include",
																				headers: { "content-type": "application/json" },
																				body: JSON.stringify({ user_id: d.user_id })
																			});
																			if (!res.ok) {
																				const b = await res.json().catch(() => null);
																				window.alert("Delete failed: " + (b?.error || res.statusText));
																			} else {
																				window.alert("User deleted");
																				setDownloads((prev) => prev.filter((x) => x.user_id !== d.user_id));
																				setSessions((prev) => prev.filter((s) => s.user_id !== d.user_id));
																			}
																		} catch (e) {
																			window.alert("Delete failed: " + String(e));
																		}
																	},
																	className: "text-xs text-red-400 hover:text-red-300",
																	children: "Delete user"
																}) : null]
															})
														})
													]
												}, d.id)) })]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "overflow-hidden rounded-3xl bg-white/5 p-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "text-lg font-medium",
												children: "Notifications"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "flex items-center gap-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													onClick: async () => {
														await clearAll();
													},
													className: "text-xs text-white/60 hover:text-white",
													children: "Clear all"
												})
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-4 space-y-3 text-sm text-white/70",
											children: [notifications.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-white/50",
												children: "No notifications"
											}), notifications.map((note) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: `rounded-2xl p-4 flex justify-between items-start border ${note.read ? "border-white/10 bg-background/70" : "border-accent/50 bg-accent/900"}`,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex items-center gap-3",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "text-xl",
															children: note.type_detail === "visitor" || note.payload?.type_detail === "visitor" || note.type === "visitor_arrival" || note.type === "visitor_left" ? "👤" : "📥"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "flex items-center gap-2",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																	className: "font-medium text-white",
																	children: note.title
																}), !note.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "inline-block h-2 w-2 rounded-full bg-accent" })]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-xs text-white/60 mt-1",
																children: new Date(note.created_at).toLocaleString()
															})]
														})]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "mt-3 grid grid-cols-2 gap-2 text-xs text-white/70 pl-9",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-white/50",
																children: "Session:"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "font-mono text-white",
																children: (note.session_id || note.payload?.session_id)?.slice(0, 8) || "—"
															})] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-white/50",
																children: "IP:"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "font-mono text-white",
																children: note.ip_address || note.payload?.ip_address || "—"
															})] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-white/50",
																children: "Country:"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-white",
																children: note.country || note.payload?.country || "—"
															})] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-white/50",
																children: "Device:"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-white",
																children: note.device || note.payload?.device || "—"
															})] }),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-white/50",
																children: "Browser:"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-white",
																children: note.browser || note.payload?.browser || "—"
															})] }),
															(note.filename || note.payload?.filename) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-white/50",
																children: "File:"
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-white",
																children: note.filename || note.payload?.filename
															})] })
														]
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex flex-col gap-2 ml-4",
													children: [!note.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: async () => {
															await markRead(note.id);
														},
														className: "text-xs text-white/60 hover:text-white whitespace-nowrap",
														title: "Mark as read",
														children: "✓ Mark read"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: async () => {
															if (!window.confirm("Delete notification?")) return;
															await remove(note.id);
														},
														className: "text-xs text-red-400 hover:text-red-300 whitespace-nowrap",
														title: "Delete this notification",
														children: "🗑️ Delete"
													})]
												})]
											}, note.id))]
										})]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-6 grid gap-4 sm:grid-cols-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-2xl bg-white/5 p-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-white/70",
										children: "Use the admin password to gate access to studio management content."
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "rounded-2xl bg-white/5 p-4",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-white/70",
										children: "Sign out will clear the admin cookie and return you to the login page."
									})
								})]
							})
						]
					})
				]
			})
		]
	});
}
//#endregion
export { Admin as component };
