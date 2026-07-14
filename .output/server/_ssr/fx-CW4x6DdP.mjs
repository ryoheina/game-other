import { a as __toESM } from "../_runtime.mjs";
import { n as require_jsx_runtime, r as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fx-CW4x6DdP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Particles({ count = 20, color = "arcane", className = "" }) {
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [reducedMotion, setReducedMotion] = (0, import_react.useState)(false);
	const items = (0, import_react.useMemo)(() => Array.from({ length: count }, (_, i) => ({
		id: i,
		size: 2 + Math.random() * 4,
		left: Math.random() * 100,
		delay: Math.random() * 12,
		dur: 14 + Math.random() * 20,
		blur: Math.random() > .8 ? "blur(1px)" : "none"
	})), [count]);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-reduced-motion: reduce)");
		setReducedMotion(media.matches);
		setMounted(true);
	}, []);
	if (!mounted || reducedMotion) return null;
	const colors = {
		arcane: "rgba(170, 195, 255, 0.35)",
		ember: "rgba(255, 148, 100, 0.32)",
		gold: "rgba(255, 215, 130, 0.34)"
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: `pointer-events-none absolute inset-0 overflow-hidden ${className}`,
		children: items.map((item) => {
			return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { style: {
				position: "absolute",
				bottom: "-10vh",
				left: `${item.left}%`,
				width: item.size,
				height: item.size,
				borderRadius: 999,
				background: colors[color],
				boxShadow: `0 0 ${10 + item.size * 4}px ${colors[color]}`,
				filter: item.blur,
				animation: `drift ${item.dur}s linear ${item.delay}s infinite`,
				opacity: .35
			} }, item.id);
		})
	});
}
function Fog({ opacity = .18, className = "" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"aria-hidden": true,
		className: `pointer-events-none absolute inset-0 ${className}`,
		style: {
			background: "radial-gradient(circle at 25% 80%, rgba(190, 210, 255, 0.16), transparent 28%), radial-gradient(circle at 80% 15%, rgba(255, 235, 175, 0.08), transparent 24%)",
			opacity,
			animation: "floatSlow 18s ease-in-out infinite"
		}
	});
}
function MouseGlow() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const el = ref.current;
		if (!el) return;
		let raf = 0;
		const onMove = (e) => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				el.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
			});
		};
		window.addEventListener("mousemove", onMove, { passive: true });
		return () => window.removeEventListener("mousemove", onMove);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref,
		"aria-hidden": true,
		className: "pointer-events-none fixed left-0 top-0 z-[1] hidden md:block",
		style: {
			width: 600,
			height: 600,
			background: "radial-gradient(closest-side, oklch(0.72 0.19 245 / 0.18), transparent 70%)",
			mixBlendMode: "screen",
			filter: "blur(8px)",
			willChange: "transform"
		}
	});
}
//#endregion
export { MouseGlow as n, Particles as r, Fog as t };
