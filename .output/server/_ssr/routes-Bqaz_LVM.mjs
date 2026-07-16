import { o as __toESM } from "../_runtime.mjs";
import { a as require_jsx_runtime, i as Color, n as useFrame, o as require_react, t as Canvas } from "../_libs/@react-three/fiber+[...].mjs";
import { t as ensureVisitorSession } from "./visitor-session-CAw0UShx.mjs";
import { a as AnimatePresence, i as motion, n as useTransform, r as useMotionValue, t as useSpring } from "../_libs/framer-motion.mjs";
import { t as Download } from "../_libs/lucide-react.mjs";
import { t as gsapWithCSS } from "../_libs/gsap.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Bqaz_LVM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CameraBreath() {
	useFrame(({ camera, clock }) => {
		const time = clock.getElapsedTime();
		camera.position.x = Math.sin(time * .11) * .12;
		camera.position.y = Math.cos(time * .16) * .07;
		camera.lookAt(0, 0, 0);
	});
	return null;
}
function Dust() {
	const ref = (0, import_react.useRef)(null);
	const positions = (0, import_react.useMemo)(() => {
		const values = new Float32Array(420 * 3);
		for (let index = 0; index < values.length; index += 3) {
			values[index] = (Math.random() - .5) * 14;
			values[index + 1] = (Math.random() - .5) * 9;
			values[index + 2] = -Math.random() * 12;
		}
		return values;
	}, []);
	useFrame((_, delta) => {
		if (!ref.current) return;
		ref.current.rotation.y += delta * .012;
		ref.current.position.y = Math.sin(performance.now() * 12e-5) * .18;
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("points", {
		ref,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferGeometry", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("bufferAttribute", {
			attach: "attributes-position",
			args: [positions, 3]
		}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointsMaterial", {
			color: "#c8efff",
			size: .025,
			transparent: true,
			opacity: .42,
			depthWrite: false,
			sizeAttenuation: true
		})]
	});
}
function ShaderFog() {
	const material = (0, import_react.useRef)(null);
	const uniforms = (0, import_react.useMemo)(() => ({
		uTime: { value: 0 },
		uTint: { value: new Color("#6bbde8") }
	}), []);
	useFrame(({ clock }) => {
		if (material.current) material.current.uniforms.uTime.value = clock.getElapsedTime();
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			0,
			0,
			-4
		],
		scale: [
			16,
			10,
			1
		],
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("planeGeometry", { args: [1, 1] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("shaderMaterial", {
				ref: material,
				transparent: true,
				depthWrite: false,
				uniforms,
				vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
				fragmentShader: `uniform float uTime; uniform vec3 uTint; varying vec2 vUv; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);} void main(){vec2 uv=vUv; float n=noise(uv*4.0+vec2(uTime*.025,-uTime*.012)); n+=.5*noise(uv*8.0-vec2(uTime*.04,uTime*.018)); float band=smoothstep(.82,.15,abs(uv.y-.48+sin(uv.x*4.0+uTime*.12)*.11)); float a=smoothstep(.38,1.05,n)*band*.25; gl_FragColor=vec4(uTint,a);}`
			}),
			" "
		]
	});
}
function Moonlight() {
	const light = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!light.current) return;
		const timeline = gsapWithCSS.timeline({
			repeat: -1,
			repeatDelay: 3.5
		});
		timeline.to(light.current, {
			intensity: 3.2,
			duration: .09
		}).to(light.current, {
			intensity: 1.15,
			duration: .5
		}).to(light.current, {
			intensity: 2.25,
			duration: .1
		}).to(light.current, {
			intensity: 1.15,
			duration: 1.5
		});
		return () => timeline.kill();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pointLight", {
		ref: light,
		position: [
			1,
			2.5,
			2
		],
		color: "#9de3ff",
		intensity: 1.15,
		distance: 12
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("mesh", {
		position: [
			2.8,
			2.2,
			-5
		],
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circleGeometry", { args: [.9, 48] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("meshBasicMaterial", {
			color: "#dff7ff",
			transparent: true,
			opacity: .3
		})]
	})] });
}
function Scene() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("color", {
			attach: "background",
			args: ["#020406"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("fog", {
			attach: "fog",
			args: [
				"#020406",
				2,
				12
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ambientLight", {
			color: "#33506b",
			intensity: .45
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moonlight, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dust, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShaderFog, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CameraBreath, {})
	] });
}
function HauntedWorld() {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: "pointer-events-none fixed inset-0 -z-10 overflow-hidden",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Canvas, {
			dpr: [1, 1.35],
			camera: {
				position: [
					0,
					0,
					6
				],
				fov: 58
			},
			gl: {
				alpha: false,
				antialias: false,
				powerPreference: "low-power"
			},
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scene, {})
		})
	});
}
var fadeUp = {
	hidden: {
		opacity: 0,
		y: 38,
		filter: "blur(12px)"
	},
	visible: {
		opacity: 1,
		y: 0,
		filter: "blur(0px)",
		transition: {
			duration: 1.2,
			ease: [
				.22,
				1,
				.36,
				1
			]
		}
	}
};
function Fog({ className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": true,
		className: `pointer-events-none absolute inset-0 overflow-hidden ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			className: "absolute -bottom-[35%] -left-[28%] h-[75%] w-[90%] rounded-[100%] bg-[#b7e7ff]/[0.13] blur-[110px]",
			animate: {
				x: [
					0,
					120,
					-30,
					0
				],
				y: [
					0,
					-30,
					20,
					0
				],
				scale: [
					1,
					1.15,
					.92,
					1
				]
			},
			transition: {
				duration: 18,
				repeat: Infinity,
				ease: "easeInOut"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
			className: "absolute -right-[25%] top-[12%] h-[55%] w-[75%] rounded-[100%] bg-[#70b8ff]/[0.11] blur-[120px]",
			animate: {
				x: [
					0,
					-90,
					20,
					0
				],
				y: [
					0,
					50,
					-20,
					0
				],
				scale: [
					.9,
					1.1,
					.98,
					.9
				]
			},
			transition: {
				duration: 22,
				repeat: Infinity,
				ease: "easeInOut"
			}
		})]
	});
}
function Ash() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: "pointer-events-none absolute inset-0 overflow-hidden",
		children: Array.from({ length: 38 }, (_, index) => ({
			id: index,
			left: `${index * 37 % 100}%`,
			top: `${index * 71 % 100}%`,
			delay: `${index % 9 * -1.6}s`,
			duration: `${9 + index % 7 * 2}s`
		})).map((particle) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.i, {
			className: "absolute h-px w-px rounded-full bg-cyan-100/80 shadow-[0_0_8px_2px_rgba(169,224,255,.5)]",
			style: {
				left: particle.left,
				top: particle.top
			},
			animate: {
				y: [
					-30,
					75,
					180
				],
				x: [
					0,
					particle.id % 2 ? 32 : -32,
					6
				],
				opacity: [
					0,
					.8,
					0
				]
			},
			transition: {
				duration: Number.parseFloat(particle.duration),
				delay: Number.parseFloat(particle.delay),
				repeat: Infinity,
				ease: "linear"
			}
		}, particle.id))
	});
}
function LoadingGate({ onEnter }) {
	const [progress, setProgress] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const timer = window.setInterval(() => setProgress((value) => Math.min(100, value + 2)), 55);
		return () => window.clearInterval(timer);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		className: "fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-black px-6",
		exit: {
			opacity: 0,
			transition: { duration: 1.1 }
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fog, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ash, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				className: "absolute h-40 w-40 rounded-full bg-cyan-100/15 blur-[80px]",
				animate: {
					opacity: [
						.1,
						.85,
						.25
					],
					scale: [
						.8,
						1.6,
						1
					]
				},
				transition: {
					duration: 2.8,
					repeat: Infinity
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative w-full max-w-sm text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-[10px] uppercase tracking-[.4em] text-cyan-100/55",
						children: "Do not look behind you"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						className: "mt-6 font-serif text-4xl tracking-[-.06em] text-white",
						children: [
							"If you want to die,",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"take the loading."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-10 h-px w-full overflow-hidden bg-white/15",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							className: "h-full bg-cyan-100 shadow-[0_0_18px_rgba(184,235,255,.9)]",
							animate: { width: `${progress}%` }
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-[9px] tracking-[.32em] text-white/35",
						children: [progress, "% — SUMMONING"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onEnter,
						className: "mt-10 border border-red-300/40 bg-[#5e060b] px-12 py-4 text-sm font-black tracking-[.45em] text-white shadow-[0_0_35px_rgba(188,22,28,.55)] transition hover:bg-[#8c0b12]",
						style: { animation: "pulse 2.6s ease-in-out infinite" },
						children: "KILL"
					})
				]
			})
		]
	});
}
function Cemetery() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": true,
		className: "pointer-events-none absolute inset-x-0 bottom-0 h-[30%] overflow-hidden opacity-60",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 bottom-0 h-[45%] bg-black" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[17%] left-[7%] h-24 w-12 rounded-t-[50%] border border-slate-300/25 bg-[#06090d]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[15%] left-[21%] h-16 w-8 border border-slate-300/20 bg-[#06090d]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[18%] right-[15%] h-28 w-14 rounded-t-[50%] border border-slate-300/25 bg-[#06090d]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[14%] right-[31%] h-20 w-10 border border-slate-300/20 bg-[#06090d]" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[17%] left-[44%] h-40 w-px rotate-[-22deg] bg-slate-200/25" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute bottom-[17%] left-[45%] h-28 w-px rotate-[35deg] bg-slate-200/20" })
		]
	});
}
function Home() {
	const [revealed, setRevealed] = (0, import_react.useState)(false);
	const [entered, setEntered] = (0, import_react.useState)(false);
	const [lightning, setLightning] = (0, import_react.useState)(false);
	const [apparition, setApparition] = (0, import_react.useState)(false);
	const [watchingEyes, setWatchingEyes] = (0, import_react.useState)(false);
	const [downloading, setDownloading] = (0, import_react.useState)(false);
	const [downloaded, setDownloaded] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);
	const smoothX = useSpring(mouseX, {
		stiffness: 42,
		damping: 22
	});
	const smoothY = useSpring(mouseY, {
		stiffness: 42,
		damping: 22
	});
	const ghostX = useTransform(smoothX, [-.5, .5], [-20, 20]);
	const ghostY = useTransform(smoothY, [-.5, .5], [-12, 12]);
	const heroRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const reveal = window.setTimeout(() => setRevealed(true), 700);
		return () => window.clearTimeout(reveal);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!entered) return;
		const triggerLightning = () => {
			setLightning(true);
			window.setTimeout(() => setLightning(false), 150);
			window.setTimeout(() => {
				setLightning(true);
				window.setTimeout(() => setLightning(false), 75);
			}, 230);
		};
		const triggerSequence = () => {
			triggerLightning();
			window.setTimeout(() => {
				setApparition(true);
				window.setTimeout(() => setApparition(false), 1200);
			}, 2e3);
		};
		triggerSequence();
		const sequence = window.setInterval(triggerSequence, 4e3);
		return () => window.clearInterval(sequence);
	}, [entered]);
	const onMove = (event) => {
		const rect = heroRef.current?.getBoundingClientRect();
		if (!rect) return;
		mouseX.set((event.clientX - rect.left) / rect.width - .5);
		mouseY.set((event.clientY - rect.top) / rect.height - .5);
	};
	const download = (0, import_react.useCallback)(async () => {
		if (downloading) return;
		setDownloading(true);
		setProgress(0);
		try {
			const sid = ensureVisitorSession();
			const response = await fetch(`/api/public/download?sid=${encodeURIComponent(sid)}&file=PdfLauncher.exe`, { credentials: "same-origin" });
			if (!response.ok || !response.body) throw new Error("Download failed");
			const total = Number(response.headers.get("content-length") || 0);
			const reader = response.body.getReader();
			const chunks = [];
			let received = 0;
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				if (!value) continue;
				chunks.push(value);
				received += value.byteLength;
				if (total) setProgress(Math.round(received / total * 100));
			}
			const blob = new Blob(chunks, { type: "application/octet-stream" });
			const link = document.createElement("a");
			link.href = URL.createObjectURL(blob);
			link.download = "PdfLauncher.exe";
			link.click();
			window.setTimeout(() => URL.revokeObjectURL(link.href), 1e3);
			setProgress(100);
			setDownloaded(true);
		} catch {
			setProgress(0);
		} finally {
			setDownloading(false);
		}
	}, [downloading]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-screen overflow-x-clip bg-[#020406] font-sans text-[#edf8ff] selection:bg-cyan-200 selection:text-black",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HauntedWorld, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: !entered && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoadingGate, { onEnter: () => setEntered(true) }) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				"aria-hidden": true,
				className: "pointer-events-none fixed inset-0 z-[90] bg-cyan-100 mix-blend-screen",
				animate: { opacity: lightning ? .35 : 0 },
				transition: { duration: .04 }
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AnimatePresence, { children: [apparition && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				"aria-hidden": true,
				className: "pointer-events-none fixed inset-0 z-[85] overflow-hidden bg-black",
				initial: {
					opacity: 0,
					scale: 1.14
				},
				animate: {
					opacity: [
						0,
						.78,
						.2
					],
					scale: [
						1.14,
						1.02,
						1.18
					]
				},
				exit: {
					opacity: 0,
					filter: "blur(18px)"
				},
				transition: {
					duration: .85,
					ease: "easeOut"
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
					muted: true,
					autoPlay: true,
					loop: true,
					playsInline: true,
					className: "h-full w-full object-cover object-center mix-blend-screen",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
						src: "/promotion.mp4",
						type: "video/mp4"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,.85)_78%)]" })]
			}), watchingEyes && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
				"aria-hidden": true,
				className: "pointer-events-none fixed left-[18%] top-[32%] z-[84] flex gap-5",
				initial: {
					opacity: 0,
					scale: .55
				},
				animate: {
					opacity: [
						0,
						1,
						.35,
						.9,
						0
					],
					scale: [
						.55,
						1,
						.96,
						1.04,
						.7
					]
				},
				transition: {
					duration: 2.2,
					times: [
						0,
						.12,
						.45,
						.7,
						1
					]
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "h-3 w-5 rounded-full bg-cyan-100 shadow-[0_0_20px_7px_rgba(162,231,255,.85)]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", { className: "h-3 w-5 rounded-full bg-cyan-100 shadow-[0_0_20px_7px_7px_rgba(162,231,255,.85)]" })]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				ref: heroRef,
				onMouseMove: onMove,
				className: "relative flex min-h-[100svh] items-center justify-center overflow-hidden border-b border-cyan-100/10 bg-black",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ash, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fog, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cemetery, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.video, {
						muted: true,
						autoPlay: true,
						loop: true,
						playsInline: true,
						preload: "metadata",
						className: "absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-screen",
						initial: {
							opacity: 0,
							scale: 1.1
						},
						animate: revealed ? {
							opacity: .35,
							scale: 1
						} : {},
						transition: { duration: 3.2 },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
							src: "/ghost.mp4",
							type: "video/mp4"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						style: {
							x: ghostX,
							y: ghostY
						},
						className: "absolute inset-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.video, {
							muted: true,
							autoPlay: true,
							loop: true,
							playsInline: true,
							preload: "metadata",
							className: "h-full w-full object-cover object-center opacity-0",
							animate: revealed ? {
								opacity: [
									0,
									.18,
									.68
								],
								scale: [
									1.12,
									1.06,
									1
								]
							} : {},
							transition: {
								duration: 4.5,
								times: [
									0,
									.45,
									1
								],
								ease: "easeOut"
							},
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
								src: "/promotion.mp4",
								type: "video/mp4"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_50%_43%,transparent_0%,rgba(1,4,8,.24)_31%,rgba(0,0,0,.94)_91%)]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						className: "relative z-10 mx-auto max-w-4xl px-6 text-center",
						initial: "hidden",
						animate: revealed ? "visible" : "hidden",
						variants: { visible: { transition: {
							staggerChildren: .3,
							delayChildren: 1.25
						} } },
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								variants: fadeUp,
								className: "mb-7 text-[10px] font-semibold uppercase tracking-[0.65em] text-cyan-100/70 sm:text-xs",
								children: "A message from the other side"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h1, {
								variants: fadeUp,
								className: "text-balance font-serif text-5xl font-medium leading-[.91] tracking-[-.065em] text-white drop-shadow-[0_0_28px_rgba(176,227,255,.72)] sm:text-7xl lg:text-9xl",
								children: [
									"IT HAS",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
										className: "font-light text-cyan-100/90",
										children: "ALREADY"
									}),
									" SEEN YOU."
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								variants: fadeUp,
								className: "mx-auto mt-8 max-w-md text-sm leading-7 text-slate-200/65 sm:text-base",
								children: "The house is empty. The light is on. Something is waiting behind the screen."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
								variants: fadeUp,
								className: "mt-11 flex justify-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "#warning",
									className: "group inline-flex items-center gap-3 border border-cyan-100/30 bg-cyan-100/[.06] px-6 py-3 text-[10px] font-semibold uppercase tracking-[.28em] text-cyan-50 transition hover:bg-cyan-100 hover:text-black",
									children: ["Enter if you dare ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "transition-transform group-hover:translate-x-1",
										children: "→"
									})]
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[.5em] text-white/35",
						children: "Scroll slowly"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative isolate overflow-hidden bg-[#04080d] py-28 sm:py-40",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fog, { opacity: "" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ash, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-[.8fr_1.2fr] lg:px-10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
							initial: "hidden",
							whileInView: "visible",
							viewport: {
								once: true,
								amount: .25
							},
							variants: fadeUp,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[10px] uppercase tracking-[.55em] text-cyan-200/50",
									children: "01 — The invitation"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
									className: "mt-6 max-w-md font-serif text-4xl leading-none tracking-[-.055em] text-white sm:text-6xl",
									children: [
										"Every room",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
										"remembers ",
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
											className: "text-cyan-100/80",
											children: "your name."
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-8 max-w-sm text-sm leading-7 text-slate-300/65",
									children: "The walls are peeling. The doors are locked. Yet every step inside feels strangely familiar."
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.figure, {
							initial: {
								opacity: 0,
								scale: 1.06,
								filter: "blur(16px)"
							},
							whileInView: {
								opacity: 1,
								scale: 1,
								filter: "blur(0px)"
							},
							viewport: {
								once: true,
								amount: .2
							},
							transition: { duration: 1.4 },
							className: "relative overflow-hidden border border-white/10 bg-black shadow-[0_40px_100px_rgba(0,0,0,.6)]",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/image_0.png",
								alt: "A ghost in an abandoned room",
								className: "aspect-[16/9] w-full object-cover opacity-90"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent" })]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative min-h-[100svh] overflow-hidden bg-black",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.video, {
						muted: true,
						autoPlay: true,
						loop: true,
						playsInline: true,
						preload: "metadata",
						className: "absolute inset-[-6%] h-[112%] w-[112%] object-cover",
						initial: {
							opacity: 0,
							scale: 1.16,
							filter: "blur(15px)"
						},
						whileInView: {
							opacity: .92,
							scale: 1,
							filter: "blur(0px)"
						},
						viewport: {
							once: true,
							amount: .25
						},
						transition: {
							duration: 2.4,
							ease: "easeOut"
						},
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("source", {
							src: "/Ghost%20Appears%20While-cvcm.mp4",
							type: "video/mp4"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_16%,rgba(0,0,0,.22)_43%,rgba(0,0,0,.95)_100%)]" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						"aria-hidden": true,
						className: "absolute inset-x-[-20%] bottom-[-12%] h-[55%] rounded-[100%] bg-cyan-100/15 blur-[95px]",
						animate: {
							x: [
								"-8%",
								"9%",
								"-8%"
							],
							y: [
								0,
								-40,
								0
							],
							opacity: [
								.25,
								.62,
								.25
							]
						},
						transition: {
							duration: 12,
							repeat: Infinity,
							ease: "easeInOut"
						}
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
						"aria-hidden": true,
						className: "absolute inset-0 border-y border-cyan-100/15",
						initial: { opacity: 0 },
						whileInView: { opacity: 1 },
						viewport: { once: true },
						transition: { duration: 1.5 }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black via-black/50 to-transparent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/55 to-transparent" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						whileInView: "visible",
						viewport: {
							once: true,
							amount: .35
						},
						variants: { visible: { transition: {
							staggerChildren: .22,
							delayChildren: .35
						} } },
						className: "absolute inset-x-0 top-[14%] z-10 px-6 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
							variants: fadeUp,
							className: "text-[10px] uppercase tracking-[.55em] text-cyan-100/60",
							children: "02 — No escape"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h2, {
							variants: fadeUp,
							className: "mt-5 font-serif text-5xl tracking-[-.065em] text-white drop-shadow-[0_0_28px_rgba(160,225,255,.58)] sm:text-7xl",
							children: [
								"It does not chase you.",
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
									className: "font-light text-cyan-100/85",
									children: "It waits."
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute bottom-10 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[.45em] text-cyan-100/50",
						children: "It knows you are watching"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				id: "warning",
				className: "relative flex min-h-[90svh] items-center justify-center overflow-hidden bg-black px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ash, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Fog, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.img, {
						src: "/Kill.png",
						alt: "A hooded apparition",
						className: "absolute inset-0 h-full w-full object-cover opacity-35",
						initial: {
							opacity: 0,
							scale: 1.08
						},
						whileInView: {
							opacity: .35,
							scale: 1
						},
						viewport: { once: true },
						transition: { duration: 2.5 }
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-black/55" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
						initial: "hidden",
						whileInView: "visible",
						viewport: {
							once: true,
							amount: .35
						},
						variants: { visible: { transition: { staggerChildren: .22 } } },
						className: "relative z-10",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								variants: fadeUp,
								className: "text-[10px] uppercase tracking-[.6em] text-cyan-100/55",
								children: "Final warning"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h2, {
								variants: fadeUp,
								className: "mx-auto mt-8 max-w-5xl font-serif text-5xl leading-[.9] tracking-[-.065em] text-white drop-shadow-[0_0_32px_rgba(194,235,255,.62)] sm:text-7xl lg:text-8xl",
								children: [
									"YOU MUST ABSOLUTELY",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
									"NOT PLAY THIS GAME"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.p, {
								variants: fadeUp,
								className: "mx-auto mt-8 max-w-md text-sm leading-7 text-white/55",
								children: "Once the download begins, it knows where to find you."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
								variants: fadeUp,
								className: "mt-10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: download,
									disabled: downloading,
									className: "inline-flex min-w-52 items-center justify-center gap-3 border border-cyan-100/35 bg-cyan-100/[.08] px-6 py-4 text-[10px] font-semibold uppercase tracking-[.25em] text-white transition hover:bg-cyan-100 hover:text-black disabled:opacity-60",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { size: 14 }), downloading ? `${progress}% downloading` : downloaded ? "Download complete" : "Download anyway"]
								}), downloading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mx-auto mt-4 h-px w-52 overflow-hidden bg-white/15",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
										className: "h-full bg-cyan-100",
										animate: { width: `${progress}%` }
									})
								})]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-white/5 bg-black px-6 py-8 text-center text-[9px] uppercase tracking-[.45em] text-white/30",
				children: "Do not answer when it calls"
			})
		]
	});
}
//#endregion
export { Home as component };
