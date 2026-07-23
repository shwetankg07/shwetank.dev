"use client";

import { useEffect, useState } from "react";

// Theme toggle in registry style. The inline script in layout.tsx applies the
// stored theme before paint; this button just flips it.

function resolved(): "light" | "dark" {
  const set = document.documentElement.dataset.theme;
  if (set === "dark" || set === "light") return set;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setTheme(resolved()), 0);
    return () => clearTimeout(t);
  }, []);

  const flip = (e: React.MouseEvent) => {
    const next = resolved() === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem("reg-theme", next);
      } catch {}
      setTheme(next);
    };

    // circular wipe from the click point, when the browser can do it
    const doc = document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!doc.startViewTransition || reduced) {
      apply();
      return;
    }
    const x = e.clientX || window.innerWidth - 40;
    const y = e.clientY || 28;
    const r = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );
    // Hand the wipe geometry to the CSS @keyframes (globals.css). CSS clips the
    // incoming layer from its first painted frame, so the new theme never
    // flashes before the animation — the bug you get when animating post-ready.
    const rootStyle = document.documentElement.style;
    rootStyle.setProperty("--wipe-x", `${x}px`);
    rootStyle.setProperty("--wipe-y", `${y}px`);
    rootStyle.setProperty("--wipe-r", `${r}px`);
    doc.startViewTransition(apply);
  };

  return (
    <button
      onClick={flip}
      className="whitespace-nowrap font-mono text-xs sm:text-sm text-muted hover:text-npmred transition-colors"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title="toggle theme"
    >
      {theme === null ? "--theme" : theme === "dark" ? "--light" : "--dark"}
    </button>
  );
}
