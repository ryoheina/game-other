import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

const items = [
  { href: "#features", label: "Gameplay" },
  { href: "#gallery", label: "Gallery" },
  { href: "#trailer", label: "Trailer" },
  { href: "#download", label: "Download" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${scrolled ? "py-3" : "py-5"}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md glass glow-blue">
            <span className="display text-gradient-gold text-lg">L</span>
          </span>
          <span className="display text-sm tracking-[0.35em] text-white/80 group-hover:text-white">
            LEGENDS OF ETERNITY
          </span>
        </Link>
        <nav className={`hidden items-center gap-1 rounded-full px-2 py-1 md:flex ${scrolled ? "glass" : ""}`}>
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="rounded-full px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 hover:text-white"
            >
              {it.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
