"use client";

import { useEffect, useState } from "react";
import { deps, projects } from "@/lib/data";

// Sticky section nav. The right side renders scroll progress as a pacman bar.

const BAR_WIDTH = 12;

export default function TabBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setPct(max > 0 ? Math.min(100, Math.round((window.scrollY / max) * 100)) : 0);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const tabs = [
    { href: "#readme", label: "readme" },
    { href: "#dependencies", label: `${deps.length} dependencies` },
    { href: "#packages", label: `${projects.length} packages` },
    { href: "#changelog", label: "changelog" },
    { href: "#contact", label: "contact" },
  ];
  // scroll progress, but it's pacman eating dots toward the ghost at 100%
  const eaten = Math.min(BAR_WIDTH - 1, Math.round((pct / 100) * BAR_WIDTH));
  const dotsLeft = Math.max(0, BAR_WIDTH - 1 - eaten);
  const caught = pct >= 100;

  return (
    <nav
      aria-label="Sections"
      className="sticky top-0 z-40 border-y border-hairline bg-paper/95 backdrop-blur-sm"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 flex items-center gap-6 font-mono text-sm">
        <div className="flex gap-6 overflow-x-auto">
          {tabs.map((t) => (
            <a
              key={t.href}
              href={t.href}
              className="whitespace-nowrap py-3 border-b-2 border-transparent text-muted hover:text-ink hover:border-npmred transition-colors"
            >
              {t.label}
            </a>
          ))}
        </div>
        <span
          className="ml-auto hidden md:inline whitespace-pre text-xs text-muted select-none"
          aria-hidden
        >
          [{" ".repeat(eaten)}
          <span className="text-ink font-bold">C</span>
          {"·".repeat(dotsLeft)}
          {caught ? (
            <span className="text-muted"> nom</span>
          ) : (
            <span className="text-npmred font-bold">M</span>
          )}
          ] {String(pct).padStart(3)}%
        </span>
      </div>
    </nav>
  );
}
