"use client";

import { useEffect, useState } from "react";

const BORN = new Date("2007-01-04T00:00:00+05:30");

function format(now: number) {
  const ms = now - BORN.getTime();
  if (ms < 0) return "not yet booted";
  const days = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${days.toLocaleString("en-IN")} days, ${pad(h)}:${pad(m)}:${pad(s)}`;
}

export default function Uptime() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const t0 = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, []);

  // SSR / no-JS fallback keeps the row meaningful
  if (now === null) return <span>since 2007, no reboots</span>;
  return <span className="tabular-nums">{format(now)}</span>;
}
