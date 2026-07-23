"use client";

import { useEffect, useRef, useState } from "react";
import { depNodes, depEdges } from "@/lib/data";

// The skills graph, as a 3D constellation. Force-directed layout in three
// dimensions, orbit camera, perspective projection — all hand-rolled on a 2D
// canvas, no three.js. Drag to orbit; hover a node to trace its edges.
// The [2d] toggle switches to a flat draggable layout. The table below the
// graph is the accessible / no-JS version of this data.

type SimNode = {
  id: string;
  label: string;
  root: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  w: number; // base label width at 12px
  h: number;
  // last projected values (for hit-testing)
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  depth: number;
};

// canvas can't use CSS variables — read the current theme's values off :root
function readColors() {
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  return {
    paper: v("--paper", "#fafaf8"),
    ink: v("--ink", "#1c1c1a"),
    hairline: v("--hairline", "#d9d8d0"),
    red: v("--npmred", "#cb3837"),
    faint: v("--faint", "#f1f0eb"),
  };
}

export default function DepGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mode, setMode] = useState<"3d" | "2d">("3d");

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const is3d = mode === "3d";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let COLORS = readColors();
    const themeObserver = new MutationObserver(() => {
      COLORS = readColors();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      COLORS = readColors();
    };
    scheme.addEventListener("change", onScheme);

    const monoFamily =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--font-jbmono")
        .trim() || "monospace";
    const font = (size: number, bold = false) =>
      `${bold ? "bold " : ""}${size}px ${monoFamily}, monospace`;

    let width = 0;
    let height = 0;
    let radius = 200; // world sphere radius
    let raf = 0;
    let visible = true;
    let hoveredId: string | null = null;
    let draggedNode: SimNode | null = null; // 2d mode
    let orbiting = false; // 3d mode
    let yaw = 0.6;
    let pitch = 0.3;
    let lastPointer = { x: 0, y: 0 };

    const nodes: SimNode[] = depNodes.map((n) => ({
      id: n.id,
      label: `${n.id}@${n.version}`,
      root: !!n.root,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      w: 0,
      h: 24,
      sx: 0,
      sy: 0,
      sw: 0,
      sh: 0,
      depth: 0,
    }));
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const edges = depEdges
      .map(([a, b]) => ({ a: byId.get(a)!, b: byId.get(b)! }))
      .filter((e) => e.a && e.b);
    const neighbors = new Map<string, Set<string>>();
    for (const e of edges) {
      if (!neighbors.has(e.a.id)) neighbors.set(e.a.id, new Set());
      if (!neighbors.has(e.b.id)) neighbors.set(e.b.id, new Set());
      neighbors.get(e.a.id)!.add(e.b.id);
      neighbors.get(e.b.id)!.add(e.a.id);
    }

    const measure = () => {
      for (const n of nodes) {
        ctx.font = n.root ? font(13, true) : font(12);
        n.w = ctx.measureText(n.label).width + 20;
        n.h = n.root ? 30 : 24;
      }
    };

    const scatter = () => {
      let seed = 7;
      const rand = () => {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      };
      for (const n of nodes) {
        if (n.root) {
          n.x = n.y = n.z = 0;
        } else {
          // roughly uniform on a ball
          const u = rand() * 2 - 1;
          const phi = rand() * Math.PI * 2;
          const r = radius * (0.4 + 0.6 * rand());
          const s = Math.sqrt(1 - u * u);
          n.x = r * s * Math.cos(phi);
          n.y = r * u * 0.8;
          n.z = is3d ? r * s * Math.sin(phi) : 0;
        }
        n.vx = n.vy = n.vz = 0;
      }
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      radius = Math.min(width, height) * 0.42;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measure();
    };

    const step = () => {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let dz = a.z - b.z;
          const d2 = dx * dx + dy * dy + dz * dz || 1;
          const d = Math.sqrt(d2);
          const force = Math.min((is3d ? 5200 : 3400) / d2, 4);
          dx /= d;
          dy /= d;
          dz /= d;
          a.vx += dx * force;
          a.vy += dy * force;
          a.vz += dz * force;
          b.vx -= dx * force;
          b.vy -= dy * force;
          b.vz -= dz * force;
        }
      }
      for (const e of edges) {
        const dx = e.b.x - e.a.x;
        const dy = e.b.y - e.a.y;
        const dz = e.b.z - e.a.z;
        const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
        const ideal = e.a.root || e.b.root ? radius * 0.62 : radius * 0.42;
        const f = (d - ideal) * 0.012;
        e.a.vx += (dx / d) * f;
        e.a.vy += (dy / d) * f;
        e.a.vz += (dz / d) * f;
        e.b.vx -= (dx / d) * f;
        e.b.vy -= (dy / d) * f;
        e.b.vz -= (dz / d) * f;
      }
      for (const n of nodes) {
        n.vx += -n.x * 0.0015;
        n.vy += -n.y * 0.0015;
        n.vz += -n.z * 0.0015;
        if (n === draggedNode) {
          n.vx = n.vy = n.vz = 0;
          continue;
        }
        n.vx *= 0.86;
        n.vy *= 0.86;
        n.vz *= 0.86;
        n.x += n.vx;
        n.y += n.vy;
        n.z += is3d ? n.vz : 0;
        if (!is3d) {
          n.z = 0;
          const mx = width / 2 - n.w / 2 - 6;
          const my = height / 2 - n.h / 2 - 6;
          n.x = Math.max(-mx, Math.min(mx, n.x));
          n.y = Math.max(-my, Math.min(my, n.y));
        } else {
          const len = Math.hypot(n.x, n.y, n.z);
          if (len > radius) {
            const k = radius / len;
            n.x *= k;
            n.y *= k;
            n.z *= k;
          }
        }
      }
    };

    const project = () => {
      const f = radius * 3.2;
      const cy0 = Math.cos(yaw);
      const sy0 = Math.sin(yaw);
      const cp = Math.cos(pitch);
      const sp = Math.sin(pitch);
      for (const n of nodes) {
        if (!is3d) {
          n.sx = width / 2 + n.x;
          n.sy = height / 2 + n.y;
          n.sw = n.w;
          n.sh = n.h;
          n.depth = 0;
          continue;
        }
        const x1 = n.x * cy0 + n.z * sy0;
        const z1 = -n.x * sy0 + n.z * cy0;
        const y1 = n.y * cp - z1 * sp;
        const z2 = n.y * sp + z1 * cp;
        const s = f / (f + z2);
        n.sx = width / 2 + x1 * s;
        n.sy = height / 2 + y1 * s;
        n.sw = n.w * s;
        n.sh = n.h * s;
        n.depth = z2;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const e of edges) {
        const active =
          hoveredId !== null && (e.a.id === hoveredId || e.b.id === hoveredId);
        const depthAlpha = is3d
          ? Math.max(0.25, 1 - (e.a.depth + e.b.depth) / (radius * 4))
          : 1;
        ctx.globalAlpha = active ? 1 : depthAlpha * 0.9;
        ctx.strokeStyle = active ? COLORS.red : COLORS.hairline;
        ctx.lineWidth = active ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(e.a.sx, e.a.sy);
        ctx.lineTo(e.b.sx, e.b.sy);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // far nodes first, root always last so nothing overlaps it
      const order = [...nodes].sort(
        (a, b) => b.depth - a.depth || Number(a.root) - Number(b.root)
      );
      for (const n of order) {
        const isHover = n.id === hoveredId;
        const isNeighbor =
          hoveredId !== null && neighbors.get(hoveredId)?.has(n.id);
        const dimmed = hoveredId !== null && !isHover && !isNeighbor;
        const scale = is3d ? n.sw / n.w : 1;
        const depthAlpha = is3d
          ? Math.max(0.4, Math.min(1, 1 - n.depth / (radius * 2.4)))
          : 1;
        ctx.globalAlpha = (dimmed ? 0.3 : 1) * depthAlpha;
        const x = n.sx - n.sw / 2;
        const y = n.sy - n.sh / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, n.sw, n.sh, 5 * scale);
        ctx.fillStyle = n.root ? COLORS.red : isHover ? COLORS.faint : COLORS.paper;
        ctx.fill();
        ctx.strokeStyle = n.root ? COLORS.red : isHover ? COLORS.red : COLORS.hairline;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = n.root
          ? font(Math.max(8, 13 * scale), true)
          : font(Math.max(8, 12 * scale));
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = n.root ? "#fff" : isHover ? COLORS.red : COLORS.ink;
        ctx.fillText(n.label, n.sx, n.sy + 0.5);
        ctx.globalAlpha = 1;
      }
    };

    const hit = (x: number, y: number) =>
      [...nodes]
        .sort((a, b) => a.depth - b.depth || Number(b.root) - Number(a.root))
        .find(
          (n) =>
            Math.abs(x - n.sx) <= n.sw / 2 + 4 && Math.abs(y - n.sy) <= n.sh / 2 + 4
        ) ?? null;

    let settled = false;
    const loop = () => {
      if (visible) {
        if (!reduced || draggedNode || !settled) step();
        if (is3d && !reduced && !orbiting && !hoveredId) yaw += 0.0022;
        project();
        draw();
      }
      raf = requestAnimationFrame(loop);
    };

    const toLocal = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onPointerDown = (e: PointerEvent) => {
      const p = toLocal(e);
      lastPointer = p;
      if (is3d) {
        orbiting = true;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
        return;
      }
      const n = hit(p.x, p.y);
      if (n) {
        draggedNode = n;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      const p = toLocal(e);
      if (is3d && orbiting) {
        // grab-the-globe feel: the front of the sphere follows the cursor on
        // both axes. yaw is negated (dragging right must decrease yaw so the
        // near face, at z<0, moves right); pitch keeps its sign.
        yaw -= (p.x - lastPointer.x) * 0.005;
        pitch = Math.max(-1.1, Math.min(1.1, pitch + (p.y - lastPointer.y) * 0.004));
        lastPointer = p;
        return;
      }
      lastPointer = p;
      if (draggedNode) {
        draggedNode.x = p.x - width / 2;
        draggedNode.y = p.y - height / 2;
        return;
      }
      const n = hit(p.x, p.y);
      const id = n?.id ?? null;
      if (id !== hoveredId) {
        hoveredId = id;
        setHovered(id);
      }
      canvas.style.cursor = n ? "grab" : is3d ? "grab" : "default";
    };
    const onPointerUp = () => {
      draggedNode = null;
      orbiting = false;
      canvas.style.cursor = "grab";
    };
    const onPointerLeave = () => {
      if (!draggedNode && !orbiting) {
        hoveredId = null;
        setHovered(null);
      }
    };

    resize();
    scatter();
    const warmup = reduced ? 400 : 90;
    for (let i = 0; i < warmup; i++) step();
    settled = true;

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(wrap);

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", onScheme);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [mode]);

  const hoveredNode = depNodes.find((n) => n.id === hovered);
  const requiredBy = hovered
    ? depEdges.filter(([, b]) => b === hovered).map(([a]) => a)
    : [];
  const dependsOn = hovered
    ? depEdges.filter(([a]) => a === hovered).map(([, b]) => b)
    : [];

  return (
    <div
      ref={wrapRef}
      // `dep-graph` is hidden by the <noscript> style in the section when JS is off
      className="dep-graph relative h-[420px] sm:h-[480px] rounded-lg border border-hairline bg-paper overflow-hidden"
    >
      <canvas ref={canvasRef} className="block touch-none" aria-hidden />
      <p
        className="pointer-events-none absolute top-3 left-4 font-mono text-xs text-muted"
        aria-hidden
      >
        {mode === "3d"
          ? "resolved dependency graph · drag to orbit"
          : "resolved dependency graph · drag the nodes"}
      </p>
      <div className="absolute top-2.5 right-3 flex gap-1 font-mono text-xs">
        {(["3d", "2d"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`px-1.5 py-0.5 rounded border transition-colors ${
              mode === m
                ? "border-npmred text-npmred"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
      <div
        className="pointer-events-none absolute bottom-3 left-4 right-4 font-mono text-xs text-muted min-h-[1.25rem]"
        aria-hidden
      >
        {hoveredNode ? (
          hoveredNode.root ? (
            <span>
              <span className="text-npmred font-bold">shwetank</span> requires
              everything above. everything above requires coffee.
            </span>
          ) : (
            <span>
              <span className="text-ink font-bold">{hoveredNode.id}</span>
              {dependsOn.length > 0 && <> → depends on: {dependsOn.join(", ")}</>}
              {requiredBy.length > 0 && (
                <>
                  {" "}
                  · required by:{" "}
                  <span className={requiredBy.includes("shwetank") ? "text-npmred" : ""}>
                    {requiredBy.join(", ")}
                  </span>
                </>
              )}
            </span>
          )
        ) : (
          <span>hover a package for details</span>
        )}
      </div>
    </div>
  );
}
