import { a as __toESM } from "../_runtime.mjs";
import { a as AnimatePresence, i as motion, n as useTransform, r as useScroll, t as useReducedMotion } from "../_libs/framer-motion.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
import { n as MouseGlow, r as Particles, t as Fog } from "./fx-CW4x6DdP.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as ensureVisitorSession } from "./visitor-session-CAw0UShx.mjs";
import { i as ArrowRight, n as Download, r as Check, t as Play } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-SDH1hSH8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var items = [
	{
		href: "#features",
		label: "Gameplay"
	},
	{
		href: "#gallery",
		label: "Gallery"
	},
	{
		href: "#trailer",
		label: "Trailer"
	},
	{
		href: "#download",
		label: "Download"
	}
];
function Nav() {
	const [scrolled, setScrolled] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
		className: `fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "py-3" : "py-5"}`,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl items-center justify-between px-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "group flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid h-9 w-9 place-items-center rounded-md glass glow-blue",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "display text-gradient-gold text-lg",
						children: "L"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "display text-sm tracking-[0.35em] text-white/80 group-hover:text-white",
					children: "LEGENDS OF ETERNITY"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: `hidden items-center gap-1 rounded-full px-2 py-1 md:flex ${scrolled ? "glass" : ""}`,
				children: items.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: it.href,
					className: "rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white",
					children: it.label
				}, it.href))
			})]
		})
	});
}
var reveal = {
	hidden: {
		opacity: 0,
		y: 28
	},
	visible: {
		opacity: 1,
		y: 0
	}
};
var HERO_VIDEOS = [
	"/hero1.mp4",
	"/hero2.mp4",
	"/hero3.mp4",
	"/hero4.mp4"
];
function useNearViewport(rootMargin = "300px") {
	const ref = (0, import_react.useRef)(null);
	const [near, setNear] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const node = ref.current;
		if (!node || near) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (!entry?.isIntersecting) return;
			setNear(true);
			observer.disconnect();
		}, { rootMargin });
		observer.observe(node);
		return () => observer.disconnect();
	}, [near, rootMargin]);
	return {
		ref,
		near
	};
}
function LazyVideo({ src, className = "", poster, autoPlay = true, controls = false }) {
	const { ref, near } = useNearViewport();
	const videoRef = (0, import_react.useRef)(null);
	const [visible, setVisible] = (0, import_react.useState)(false);
	const reducedMotion = useReducedMotion();
	(0, import_react.useEffect)(() => {
		const video = videoRef.current;
		if (!video || !near || !autoPlay || reducedMotion) return;
		const observer = new IntersectionObserver(([entry]) => {
			const isVisible = Boolean(entry?.isIntersecting);
			setVisible(isVisible);
			if (isVisible) video.play().catch(() => void 0);
			else video.pause();
		}, { threshold: .05 });
		observer.observe(video);
		return () => observer.disconnect();
	}, [
		autoPlay,
		near,
		reducedMotion
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		className,
		children: near && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
			ref: videoRef,
			className: "h-full w-full object-cover",
			src,
			poster,
			autoPlay: autoPlay && !reducedMotion,
			muted: autoPlay,
			defaultMuted: autoPlay,
			loop: autoPlay,
			playsInline: true,
			controls,
			preload: "metadata",
			"aria-hidden": autoPlay,
			"data-playing": visible
		})
	});
}
function SectionIntro({ eyebrow, title, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		variants: reveal,
		className: "mx-auto max-w-2xl text-center",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-semibold uppercase tracking-[0.38em] text-[#e8c86a]",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "display mt-4 text-4xl leading-tight text-white sm:text-5xl md:text-6xl",
				children: title
			}),
			children && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-5 text-base leading-relaxed text-white/65 sm:text-lg",
				children
			})
		]
	});
}
function DownloadButton({ onDownload, className = "", label = "Download Free" }) {
	const reducedMotion = useReducedMotion();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.button, {
		type: "button",
		onClick: onDownload,
		onPointerMove: (event) => {
			const element = event.currentTarget;
			const bounds = element.getBoundingClientRect();
			element.style.setProperty("--magnet-x", `${(event.clientX - bounds.left - bounds.width / 2) * .08}px`);
			element.style.setProperty("--magnet-y", `${(event.clientY - bounds.top - bounds.height / 2) * .08}px`);
		},
		onPointerLeave: (event) => {
			event.currentTarget.style.setProperty("--magnet-x", "0px");
			event.currentTarget.style.setProperty("--magnet-y", "0px");
		},
		whileHover: {
			scale: 1.035,
			x: "var(--magnet-x)",
			y: "var(--magnet-y)"
		},
		whileTap: { scale: .97 },
		className: `group relative isolate inline-flex min-h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-[#f7de8b] via-[#d9ae45] to-[#9e6b18] px-7 py-4 text-sm font-bold uppercase tracking-[0.16em] text-[#160f05] shadow-[0_0_0_1px_rgba(255,237,170,0.8),0_18px_55px_rgba(218,170,53,0.35)] transition-shadow hover:shadow-[0_0_0_1px_rgba(255,244,190,1),0_22px_70px_rgba(230,185,65,0.55)] ${className}`,
		children: [
			!reducedMotion && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
				"aria-hidden": true,
				className: "absolute inset-0 -z-10 rounded-full border border-[#fff1ad]",
				animate: {
					scale: [
						1,
						1.18,
						1.18
					],
					opacity: [
						.7,
						0,
						0
					]
				},
				transition: {
					duration: 1.25,
					repeat: Infinity,
					repeatDelay: 4.75
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				"aria-hidden": true,
				className: "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_110%,rgba(255,255,255,0.72),transparent_48%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-4 w-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" })
		]
	});
}
function HeroVideoCarousel() {
	const reducedMotion = useReducedMotion();
	const [activeVideo, setActiveVideo] = (0, import_react.useState)(0);
	const videoRefs = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		if (reducedMotion) return;
		const interval = window.setInterval(() => setActiveVideo((current) => (current + 1) % HERO_VIDEOS.length), 4500);
		return () => window.clearInterval(interval);
	}, [reducedMotion]);
	(0, import_react.useEffect)(() => {
		videoRefs.current.forEach((video, index) => {
			if (!video) return;
			if (index === activeVideo && !reducedMotion) video.play().catch(() => void 0);
			else video.pause();
		});
	}, [activeVideo, reducedMotion]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: HERO_VIDEOS.map((src, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.video, {
		ref: (node) => {
			videoRefs.current[index] = node;
		},
		className: "absolute inset-0 h-full w-full object-cover",
		src,
		autoPlay: index === 0 && !reducedMotion,
		muted: true,
		loop: true,
		playsInline: true,
		preload: "metadata",
		initial: false,
		animate: {
			opacity: activeVideo === index ? 1 : 0,
			scale: activeVideo === index ? 1.08 : 1.02
		},
		transition: {
			opacity: {
				duration: reducedMotion ? 0 : 1.1,
				ease: "easeInOut"
			},
			scale: {
				duration: 4.5,
				ease: "linear"
			}
		}
	}, src)) });
}
function Hero({ onDownload }) {
	const ref = (0, import_react.useRef)(null);
	const reducedMotion = useReducedMotion();
	const { scrollYProgress } = useScroll({
		target: ref,
		offset: ["start start", "end start"]
	});
	const y = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : 120]);
	const scale = useTransform(scrollYProgress, [0, 1], [1, reducedMotion ? 1 : 1.08]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "hero",
		ref,
		className: "relative isolate flex min-h-[720px] min-h-[100svh] items-center overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				style: {
					y,
					scale
				},
				className: "absolute inset-0 -z-10 origin-top",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroVideoCarousel, {})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,4,6,0.91)_0%,rgba(4,4,6,0.58)_45%,rgba(4,4,6,0.24)_100%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_28%,rgba(230,188,81,0.16),transparent_28%),linear-gradient(0deg,rgba(4,4,6,0.9),transparent_42%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "absolute inset-0 -z-0 bg-[linear-gradient(112deg,transparent_25%,rgba(255,225,140,0.1)_48%,transparent_62%)] opacity-60"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fog, {
				className: "-z-0",
				opacity: .12
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Particles, {
				count: 18,
				color: "gold",
				className: "-z-0 opacity-70"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative mx-auto w-full max-w-7xl px-6 pt-24 sm:px-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					initial: "hidden",
					animate: "visible",
					variants: { visible: { transition: { staggerChildren: .13 } } },
					className: "max-w-3xl",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
							variants: reveal,
							className: "text-xs font-bold uppercase tracking-[0.4em] text-[#edd47d]",
							children: "The next great fantasy RPG"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h1, {
							variants: reveal,
							className: "display mt-5 text-5xl leading-[0.92] text-white drop-shadow-[0_10px_35px_rgba(0,0,0,0.8)] sm:text-7xl md:text-8xl lg:text-9xl",
							children: [
								"Legends of",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-gradient-gold",
									children: "Eternity"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
							variants: reveal,
							className: "mt-7 max-w-xl text-lg leading-relaxed text-white/80 sm:text-xl",
							children: "Battle gigantic bosses, master forbidden magic, and explore a handcrafted dark fantasy kingdom."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							variants: reveal,
							className: "mt-10 flex flex-col gap-4 sm:flex-row",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, { onDownload }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: "#trailer",
								className: "inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-white/25 bg-black/25 px-7 py-4 text-sm font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md transition hover:border-[#e8c86a]/70 hover:bg-white/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-4 w-4 fill-current" }), " Watch trailer"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							variants: reveal,
							className: "mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/60",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Free to download" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Windows PC" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "No account required" })
							]
						})
					]
				})
			})
		]
	});
}
function GameplayFeatures() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "features",
		className: "overflow-hidden",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
				initial: "hidden",
				whileInView: "visible",
				viewport: {
					once: true,
					margin: "-10%"
				},
				className: "relative isolate flex min-h-[620px] items-end overflow-hidden py-20 sm:min-h-[760px] sm:py-28",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 -z-20",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyVideo, {
							src: "/play4.mp4",
							className: "h-full w-full"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[linear-gradient(0deg,rgba(4,4,6,0.94),rgba(4,4,6,0.18)_72%),linear-gradient(90deg,rgba(4,4,6,0.7),transparent_65%)]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						variants: reveal,
						className: "mx-auto w-full max-w-7xl px-6 sm:px-8",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold uppercase tracking-[0.4em] text-[#e8c86a]",
							children: "I. Discover the world"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display mt-5 max-w-2xl text-4xl leading-tight text-white sm:text-6xl",
							children: "A kingdom that hides more than it reveals."
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
				initial: "hidden",
				whileInView: "visible",
				viewport: {
					once: true,
					margin: "-10%"
				},
				variants: { visible: { transition: { staggerChildren: .14 } } },
				className: "mx-auto grid max-w-7xl items-center gap-9 px-6 py-24 sm:px-8 sm:py-32 md:grid-cols-[1.1fr_.9fr] md:gap-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					variants: reveal,
					className: "group relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/40 transition duration-500 hover:border-[#e8c86a]/55 hover:shadow-[0_18px_60px_rgba(208,160,54,0.18)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyVideo, {
						src: "/play1.mp4",
						className: "h-full w-full transition duration-700 group-hover:scale-105"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,transparent_42%,rgba(255,228,144,0.16)_50%,transparent_58%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					variants: reveal,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-bold uppercase tracking-[0.4em] text-[#e8c86a]",
							children: "II. Experience combat"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "display mt-5 text-4xl leading-tight text-white sm:text-5xl",
							children: "Every strike is a decision."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-5 max-w-md text-lg leading-relaxed text-white/65",
							children: "Dodge, commit, and make the opening count."
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.article, {
				initial: "hidden",
				whileInView: "visible",
				viewport: {
					once: true,
					margin: "-10%"
				},
				variants: { visible: { transition: { staggerChildren: .14 } } },
				className: "relative overflow-hidden bg-[#09080a] py-24 sm:py-32",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_25%_50%,rgba(107,72,179,0.3),transparent_30%),radial-gradient(circle_at_75%_50%,rgba(218,174,62,0.13),transparent_28%)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-7xl items-center gap-10 px-6 sm:px-8 md:grid-cols-2 md:gap-16",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						variants: reveal,
						className: "md:pl-12",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-bold uppercase tracking-[0.4em] text-[#e8c86a]",
								children: "III. Master the forbidden"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "display mt-5 text-4xl leading-tight text-white sm:text-5xl",
								children: "Power changes the shape of the fight."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 max-w-md text-lg leading-relaxed text-white/65",
								children: "Call on magic that turns danger into opportunity."
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						variants: reveal,
						className: "group relative aspect-[4/5] max-h-[600px] overflow-hidden rounded-[2rem] border border-[#e8c86a]/20 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.45)]",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyVideo, {
							src: "/play3.mp4",
							className: "h-full w-full transition duration-700 group-hover:scale-105"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" })]
					})]
				})]
			})
		]
	});
}
function BossShowcase() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "relative isolate min-h-[580px] overflow-hidden py-24 sm:min-h-[700px] sm:py-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 -z-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyVideo, {
					src: "/play2.mp4",
					className: "h-full w-full"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(4,4,6,0.92),rgba(4,4,6,0.48),rgba(4,4,6,0.7)),linear-gradient(0deg,rgba(4,4,6,0.88),transparent_55%)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Particles, {
				count: 16,
				color: "ember",
				className: "-z-0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: "hidden",
				whileInView: "visible",
				viewport: { once: true },
				variants: { visible: { transition: { staggerChildren: .12 } } },
				className: "mx-auto flex min-h-[390px] max-w-7xl flex-col justify-end px-6 sm:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						variants: reveal,
						className: "text-xs font-bold uppercase tracking-[0.4em] text-[#e9c96b]",
						children: "The hunt begins"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.h2, {
						variants: reveal,
						className: "display mt-5 max-w-3xl text-4xl leading-tight text-white sm:text-6xl",
						children: "Face Enemies That Demand Mastery"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						variants: reveal,
						className: "mt-5 max-w-xl text-lg leading-relaxed text-white/70",
						children: "Every boss tests your timing, resolve, and command of forbidden power."
					})
				]
			})
		]
	});
}
function GameplayGallery() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
		id: "gallery",
		className: "py-24 sm:py-32",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: "hidden",
			whileInView: "visible",
			viewport: {
				once: true,
				margin: "-100px"
			},
			variants: { visible: { transition: { staggerChildren: .08 } } },
			className: "mx-auto max-w-7xl px-6 sm:px-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
				eyebrow: "See the world in motion",
				title: "A kingdom on the brink"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
				children: [
					5,
					6,
					7,
					8,
					9,
					10
				].map((number) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					variants: reveal,
					className: "group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black transition duration-500 hover:border-[#e8c86a]/60 hover:shadow-[0_0_35px_rgba(218,175,68,0.24)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyVideo, {
						src: `/play${number}.mp4`,
						className: "h-full w-full transition duration-700 group-hover:scale-110"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-0 grid place-items-center bg-black/0 transition duration-500 group-hover:bg-black/25",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid h-12 w-12 scale-75 place-items-center rounded-full border border-white/50 bg-black/45 text-white opacity-0 transition duration-500 group-hover:scale-100 group-hover:opacity-100",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "ml-0.5 h-5 w-5 fill-current" })
						})
					})]
				}, number))
			})]
		})
	});
}
function CinematicSeparator({ src }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-hidden": true,
		className: "relative h-40 overflow-hidden border-y border-white/[0.06] sm:h-56",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LazyVideo, {
				src,
				className: "h-full w-full"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[linear-gradient(90deg,rgba(4,4,6,0.78),rgba(4,4,6,0.35),rgba(4,4,6,0.78)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-b from-[#050506] via-transparent to-[#050506]" })
		]
	});
}
function Trailer({ onDownload }) {
	const { ref, near } = useNearViewport();
	const videoRef = (0, import_react.useRef)(null);
	const [playing, setPlaying] = (0, import_react.useState)(false);
	const [finished, setFinished] = (0, import_react.useState)(false);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "trailer",
		className: "relative overflow-hidden bg-black py-24 sm:py-32",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Particles, {
			count: 12,
			color: "gold",
			className: "opacity-50"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: "hidden",
			whileInView: "visible",
			viewport: {
				once: true,
				margin: "-80px"
			},
			variants: { visible: { transition: { staggerChildren: .12 } } },
			className: "relative mx-auto max-w-6xl px-6 sm:px-8",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionIntro, {
					eyebrow: "The story awaits",
					title: "Watch the cinematic trailer"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
					variants: reveal,
					ref,
					className: "group relative mt-14 aspect-video overflow-hidden rounded-2xl border border-white/15 bg-[#080808] shadow-[0_30px_90px_rgba(0,0,0,0.6)]",
					children: [near && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
						ref: videoRef,
						src: "/Final.mp4",
						className: "h-full w-full object-cover",
						controls: playing,
						playsInline: true,
						preload: "metadata",
						onEnded: () => {
							setPlaying(false);
							setFinished(true);
						}
					}), !playing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => {
							setFinished(false);
							setPlaying(true);
							requestAnimationFrame(() => videoRef.current?.play().catch(() => setPlaying(false)));
						},
						className: "absolute inset-0 grid place-items-center bg-black/20 transition hover:bg-black/5",
						"aria-label": "Play cinematic trailer",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.span, {
							animate: { scale: [
								1,
								1.08,
								1
							] },
							transition: {
								duration: 2.8,
								repeat: Infinity
							},
							className: "grid h-20 w-20 place-items-center rounded-full border border-[#f1d981]/80 bg-black/45 pl-1 text-[#f3da7f] shadow-[0_0_45px_rgba(234,194,88,0.4)]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "h-8 w-8 fill-current" })
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: finished && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: {
						opacity: 0,
						y: 18,
						scale: .97
					},
					animate: {
						opacity: 1,
						y: 0,
						scale: 1
					},
					exit: { opacity: 0 },
					transition: {
						duration: .55,
						ease: [
							.16,
							1,
							.3,
							1
						]
					},
					className: "mt-12 text-center",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, { onDownload })
				}) })
			]
		})]
	});
}
function DownloadSection({ onDownload, status }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		id: "download",
		className: "relative isolate overflow-hidden py-24 sm:py-32",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_45%,rgba(221,176,66,0.24),transparent_25%),linear-gradient(135deg,#15100a,#050506_55%,#10101a)]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Particles, {
				count: 26,
				color: "gold",
				className: "-z-0"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				initial: "hidden",
				whileInView: "visible",
				viewport: { once: true },
				variants: { visible: { transition: { staggerChildren: .1 } } },
				className: "mx-auto max-w-4xl px-6 text-center sm:px-8",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						variants: reveal,
						className: "text-xs font-bold uppercase tracking-[0.4em] text-[#edd47d]",
						children: "Your journey begins now"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.h2, {
						variants: reveal,
						className: "display mt-5 text-4xl text-white sm:text-6xl",
						children: "Ready to Begin Your Adventure?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						variants: reveal,
						className: "mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-2",
						children: [
							"Free Download",
							"Windows",
							"Offline Play",
							"No Account Required",
							"Controller Support",
							"Frequent Updates"
						].map((benefit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-5 py-4 text-white/85",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-5 w-5 text-[#ecd174]" }), benefit]
						}, benefit))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
						variants: reveal,
						className: "mt-7 text-sm text-white/55",
						children: "Estimated download: 134 MB"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						variants: reveal,
						className: "mt-5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
							onDownload,
							label: status === "loading" ? "Preparing Download" : status === "complete" ? "Download Started" : "Download Free (Windows · 134 MB)"
						})
					}),
					status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm text-red-300",
						children: "The download could not be started. Please try again."
					})
				]
			})
		]
	});
}
function Footer() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
		className: "border-t border-white/10 bg-black px-6 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "display text-lg text-white",
				children: "LEGENDS OF ETERNITY"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-white/45",
				children: "Your legend begins with a single choice."
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs uppercase tracking-[0.22em] text-white/35",
				children: "© 2026 Legends of Eternity"
			})]
		})
	});
}
function Home() {
	const [downloadStatus, setDownloadStatus] = (0, import_react.useState)("idle");
	const [showStickyDownload, setShowStickyDownload] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const updateStickyButton = () => {
			const hero = document.getElementById("hero");
			setShowStickyDownload(Boolean(hero && hero.getBoundingClientRect().bottom <= 0));
		};
		updateStickyButton();
		window.addEventListener("scroll", updateStickyButton, { passive: true });
		return () => window.removeEventListener("scroll", updateStickyButton);
	}, []);
	const handleDownload = (0, import_react.useCallback)(() => {
		setDownloadStatus("loading");
		try {
			const sid = ensureVisitorSession();
			const url = `/api/public/download?sid=${encodeURIComponent(sid)}&file=LegendsofEternity.exe`;
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = "LegendsofEternity.exe";
			anchor.style.display = "none";
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			setDownloadStatus("complete");
		} catch {
			setDownloadStatus("error");
		}
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen overflow-x-clip bg-[#050506] text-white",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MouseGlow, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nav, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hero, { onDownload: handleDownload }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameplayFeatures, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CinematicSeparator, { src: "/background1.mp4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BossShowcase, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GameplayGallery, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CinematicSeparator, { src: "/background2.mp4" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trailer, { onDownload: handleDownload }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadSection, {
					onDownload: handleDownload,
					status: downloadStatus
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: showStickyDownload && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: {
					opacity: 0,
					y: 18
				},
				animate: {
					opacity: 1,
					y: 0
				},
				exit: {
					opacity: 0,
					y: 18
				},
				className: "fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 sm:bottom-5 sm:right-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
					onDownload: handleDownload,
					label: "Download Free",
					className: "min-h-11 px-4 py-2.5 text-xs shadow-[0_12px_45px_rgba(0,0,0,0.45)]"
				})
			}) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Footer, {})
		]
	});
}
//#endregion
export { Home as component };
