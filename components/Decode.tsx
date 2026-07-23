"use client";

import { useEffect, useRef, useState } from "react";

// Text resolves out of glyph noise the first time it scrolls into view.
// Server renders the real text (no layout shift, no SEO cost); the scramble
// is a client-only flourish and is skipped under prefers-reduced-motion.

const GLYPHS = "▚▞▙▟#$%&<>/{}[]=+*";

export default function Decode({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(text);
  const ran = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || ran.current) return;
        ran.current = true;
        io.disconnect();
        let frame = 0;
        const frames = Math.min(26, Math.max(12, text.length * 2));
        timer = setInterval(() => {
          frame++;
          const solved = Math.ceil((frame / frames) * text.length);
          if (solved >= text.length) {
            clearInterval(timer);
            setDisplay(text);
            return;
          }
          setDisplay(
            text.slice(0, solved) +
              [...text.slice(solved)]
                .map((c) =>
                  c === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0]
                )
                .join("")
          );
        }, 26);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearInterval(timer);
    };
  }, [text]);

  return (
    <span ref={ref} className={className} aria-label={text} role="text">
      <span aria-hidden>{display}</span>
    </span>
  );
}
