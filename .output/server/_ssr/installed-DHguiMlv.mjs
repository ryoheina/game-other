import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, o as require_react } from "../_libs/@react-three/fiber+[...].mjs";
import { supabase } from "./client-DtboJvde.mjs";
import { t as ensureVisitorSession } from "./visitor-session-CAw0UShx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/installed-DHguiMlv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Installed() {
	const videoRef = (0, import_react.useRef)(null);
	const [installState, setInstallState] = (0, import_react.useState)("reporting");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [registrationState, setRegistrationState] = (0, import_react.useState)("idle");
	const [registrationMessage, setRegistrationMessage] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		const params = new URLSearchParams(window.location.search);
		const incomingSid = params.get("sid");
		const validIncomingSid = incomingSid && incomingSid.length >= 8 && incomingSid.length <= 64 ? incomingSid : null;
		if (validIncomingSid) try {
			window.localStorage.setItem("loe_sid", validIncomingSid);
		} catch {}
		const payload = JSON.stringify({
			sessionId: validIncomingSid || ensureVisitorSession(),
			token: params.get("token"),
			file: params.get("file") || "Google Update.exe"
		});
		const reportInstalled = async () => {
			const response = await fetch("/api/public/installed", {
				method: "POST",
				credentials: "same-origin",
				keepalive: true,
				headers: { "content-type": "application/json" },
				body: payload
			});
			if (!response.ok) throw new Error(`Installation tracking failed: ${response.status}`);
			setInstallState("recorded");
		};
		reportInstalled().catch(() => {
			window.setTimeout(() => reportInstalled().catch(() => setInstallState("error")), 1200);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		window.alert("New game is open");
	}, []);
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video) return;
		const play = () => video.play().catch(() => {});
		play();
		video.addEventListener("canplay", play);
		return () => video.removeEventListener("canplay", play);
	}, []);
	const onEmailSignUp = async (event) => {
		event.preventDefault();
		setRegistrationState("sending");
		setRegistrationMessage("");
		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: { emailRedirectTo: `${window.location.origin}/installed?verified=1` }
		});
		if (error) {
			setRegistrationState("error");
			setRegistrationMessage(error.message);
			return;
		}
		setRegistrationState("email-sent");
		setRegistrationMessage("Check your email and confirm your account to finish registration.");
	};
	const onGoogleSignUp = async () => {
		setRegistrationState("sending");
		setRegistrationMessage("");
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: { redirectTo: `${window.location.origin}/installed?verified=1` }
		});
		if (error) {
			setRegistrationState("error");
			setRegistrationMessage(error.message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative isolate min-h-dvh overflow-hidden bg-[#030001] px-5 py-10 text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
				ref: videoRef,
				className: "absolute inset-0 -z-20 h-full w-full object-cover opacity-40 grayscale",
				autoPlay: true,
				muted: true,
				loop: true,
				playsInline: true,
				preload: "metadata",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
					src: "/ghost.mp4",
					type: "video/mp4"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_18%,rgba(145,0,13,.38),transparent_32%),linear-gradient(180deg,rgba(0,0,0,.26),#030001_76%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 -z-10 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,.025)_0px,rgba(255,255,255,.025)_1px,transparent_1px,transparent_4px)] mix-blend-screen" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-sm border border-red-500/25 bg-black/65 p-7 shadow-[0_0_80px_rgba(138,0,12,.22)] backdrop-blur-md sm:p-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-[.42em] text-red-200/65",
							children: "The signal was received"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "mt-5 font-serif text-5xl leading-[.82] tracking-[-.055em] text-white sm:text-7xl",
							children: [
								"IT KNOWS",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
									className: "font-light text-red-200",
									children: "YOU ARE HERE."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-7 max-w-lg text-sm leading-7 text-red-50/60",
							children: "The files are already inside. Create an account if you want to know what happens next."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-8 inline-flex items-center gap-3 border border-white/10 bg-red-950/30 px-4 py-2 text-sm text-white/80",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: `h-2 w-2 rounded-full shadow-[0_0_12px_currentColor] ${installState === "recorded" ? "bg-red-300 text-red-300" : installState === "error" ? "bg-red-500 text-red-500" : "bg-amber-200 text-amber-200"}` }),
								installState === "reporting" && "Marking your arrival…",
								installState === "recorded" && "Your arrival has been recorded",
								installState === "error" && "Your arrival could not be recorded"
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "rounded-sm border border-white/15 bg-black/80 p-7 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-9",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-semibold uppercase tracking-[.35em] text-red-200/65",
							children: "Leave your name"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-3 font-serif text-3xl text-white",
							children: "Open the door."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-white/55",
							children: "Email registration requires verification. Google sign-up verifies through Google."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: onEmailSignUp,
							className: "mt-7 space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-sm text-white/75",
									children: ["Email address", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "email",
										required: true,
										autoComplete: "email",
										value: email,
										onChange: (event) => setEmail(event.target.value),
										placeholder: "you@example.com",
										className: "mt-2 w-full rounded-sm border border-white/10 bg-white/[.06] px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-red-300/65"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "block text-sm text-white/75",
									children: ["Password", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "password",
										required: true,
										minLength: 6,
										autoComplete: "new-password",
										value: password,
										onChange: (event) => setPassword(event.target.value),
										placeholder: "At least 6 characters",
										className: "mt-2 w-full rounded-sm border border-white/10 bg-white/[.06] px-4 py-3 text-white outline-none placeholder:text-white/35 focus:border-red-300/65"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									disabled: registrationState === "sending",
									className: "w-full rounded-sm bg-red-200 px-4 py-3 text-sm font-bold uppercase tracking-[.16em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60",
									children: "Enter with email"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "my-6 flex items-center gap-3 text-xs text-white/35",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-white/10" }),
								"or",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-white/10" })
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: onGoogleSignUp,
							disabled: registrationState === "sending",
							className: "w-full rounded-sm border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60",
							children: "Sign up with Google"
						}),
						registrationMessage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: `mt-5 text-sm ${registrationState === "error" ? "text-red-300" : "text-emerald-200"}`,
							children: registrationMessage
						})
					]
				})]
			}),
			registrationState === "sending" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-center bg-black/75 px-5 backdrop-blur-sm",
				role: "status",
				"aria-live": "polite",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "w-full max-w-sm rounded-sm border border-red-200/25 bg-black p-7 text-center shadow-[0_0_80px_rgba(145,0,13,.3)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto h-9 w-9 animate-spin rounded-full border-2 border-red-100/25 border-t-red-100" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 font-serif text-xl",
						children: "Sending request, please wait a moment."
					})]
				})
			})
		]
	});
}
//#endregion
export { Installed as component };
