import { useEffect, useMemo, useRef, useState } from "react";

export function Particles({ count = 20, color = "arcane", className = "" }: { count?: number; color?: "arcane" | "ember" | "gold"; className?: string }) {
  const [mounted, setMounted] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 2 + Math.random() * 4,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        dur: 14 + Math.random() * 20,
        blur: Math.random() > 0.8 ? "blur(1px)" : "none",
      })),
    [count],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(media.matches);
    setMounted(true);
  }, []);

  if (!mounted || reducedMotion) return null;
  const colors = {
    arcane: "rgba(170, 195, 255, 0.35)",
    ember: "rgba(255, 148, 100, 0.32)",
    gold: "rgba(255, 215, 130, 0.34)",
  };
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {items.map((item) => {
        return (
          <span
            key={item.id}
            style={{
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
              opacity: 0.35,
            }}
          />
        );
      })}
    </div>
  );
}

export function Fog({ opacity = 0.18, className = "" }: { opacity?: number; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        background:
          "radial-gradient(circle at 25% 80%, rgba(190, 210, 255, 0.16), transparent 28%), radial-gradient(circle at 80% 15%, rgba(255, 235, 175, 0.08), transparent 24%)",
        opacity,
        animation: "floatSlow 18s ease-in-out infinite",
      }}
    />
  );
}

export function MouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${e.clientX - 300}px, ${e.clientY - 300}px, 0)`;
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[1] hidden md:block"
      style={{
        width: 600,
        height: 600,
        background:
          "radial-gradient(closest-side, oklch(0.72 0.19 245 / 0.18), transparent 70%)",
        mixBlendMode: "screen",
        filter: "blur(8px)",
        willChange: "transform",
      }}
    />
  );
}
