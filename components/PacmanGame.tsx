"use client";

import { useEffect, useRef, useState } from "react";

// `pacman` with no arguments. Of course this had to exist.
// Arrows / hjkl / wasd to move, q or Esc to quit.

const MAZE = [
  "###################",
  "#.................#",
  "#.#.#.#.#.#.#.#.#.#",
  "#.................#",
  "#.#.#.#.#.#.#.#.#.#",
  "#.................#",
  "#.#.#.#.#.#.#.#.#.#",
  "#.................#",
  "#.#.#.#.#.#.#.#.#.#",
  "#.................#",
  "###################",
];
const W = MAZE[0].length;
const H = MAZE.length;
const TICK_MS = 150;

type Dir = readonly [number, number];
const DIRS: Record<string, Dir> = {
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  k: [0, -1],
  j: [0, 1],
  h: [-1, 0],
  l: [1, 0],
  w: [0, -1],
  s: [0, 1],
  a: [-1, 0],
  d: [1, 0],
};

const wall = (x: number, y: number) => (MAZE[y]?.[x] ?? "#") === "#";

type GameState = {
  px: number;
  py: number;
  dir: Dir;
  ghosts: { x: number; y: number }[];
  dots: Set<string>;
  score: number;
  over: null | "quit" | "win" | "lose";
};

function initState(): GameState {
  const dots = new Set<string>();
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) if (MAZE[y][x] === ".") dots.add(`${x},${y}`);
  dots.delete("9,9");
  dots.delete("5,5");
  dots.delete("13,5");
  return {
    px: 9,
    py: 9,
    dir: [0, 0],
    ghosts: [
      { x: 5, y: 5 },
      { x: 13, y: 5 },
    ],
    dots,
    score: 0,
    over: null,
  };
}

function step(s: GameState, next: Dir): GameState {
  if (s.over) return s;
  let { px, py, score } = s;
  let dir = s.dir;
  if (!wall(px + next[0], py + next[1])) dir = next;
  if (!wall(px + dir[0], py + dir[1])) {
    px += dir[0];
    py += dir[1];
  }
  const dots = new Set(s.dots);
  if (dots.delete(`${px},${py}`)) score += 10;

  const ghosts = s.ghosts.map((g) => {
    const options = ([[0, -1], [0, 1], [-1, 0], [1, 0]] as const).filter(
      ([dx, dy]) => !wall(g.x + dx, g.y + dy)
    );
    if (options.length === 0) return g;
    let pick: Dir;
    if (Math.random() < 0.75) {
      pick = options.reduce((best, o) => {
        const d1 = Math.abs(g.x + o[0] - px) + Math.abs(g.y + o[1] - py);
        const d2 = Math.abs(g.x + best[0] - px) + Math.abs(g.y + best[1] - py);
        return d1 < d2 ? o : best;
      });
    } else {
      pick = options[Math.floor(Math.random() * options.length)];
    }
    return { x: g.x + pick[0], y: g.y + pick[1] };
  });

  const caught = ghosts.some((g) => g.x === px && g.y === py);
  return {
    px,
    py,
    dir,
    ghosts,
    dots,
    score,
    over: caught ? "lose" : dots.size === 0 ? "win" : null,
  };
}

export default function PacmanGame({
  onExit,
}: {
  onExit: (result: { score: number; won: boolean | null }) => void;
}) {
  const [gs, setGs] = useState<GameState>(initState);
  const nextDir = useRef<Dir>([0, 0]);
  const exited = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "q" || e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        setGs((s) => (s.over ? s : { ...s, over: "quit" }));
        return;
      }
      const d = DIRS[e.key];
      if (d) {
        e.preventDefault();
        nextDir.current = d;
      }
    };
    // capture phase so the global Escape/slash handlers never see game keys
    window.addEventListener("keydown", onKey, { capture: true });
    const t = setInterval(() => setGs((s) => step(s, nextDir.current)), TICK_MS);
    return () => {
      clearInterval(t);
      window.removeEventListener("keydown", onKey, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (gs.over && !exited.current) {
      exited.current = true;
      onExit({
        score: gs.score,
        won: gs.over === "quit" ? null : gs.over === "win",
      });
    }
  }, [gs.over, gs.score, onExit]);

  const rows = [];
  for (let y = 0; y < H; y++) {
    const cells = [];
    for (let x = 0; x < W; x++) {
      if (x === gs.px && y === gs.py) {
        cells.push(
          <span key={x} className="text-[#f2c744] font-bold">
            C
          </span>
        );
      } else if (gs.ghosts.some((g) => g.x === x && g.y === y)) {
        cells.push(
          <span key={x} className="text-npmred font-bold">
            M
          </span>
        );
      } else if (MAZE[y][x] === "#") {
        cells.push(
          <span key={x} className="text-term-dim/60">
            #
          </span>
        );
      } else if (gs.dots.has(`${x},${y}`)) {
        cells.push(<span key={x}>·</span>);
      } else {
        cells.push(<span key={x}> </span>);
      }
    }
    rows.push(<div key={y}>{cells}</div>);
  }

  return (
    <div className="whitespace-pre" aria-label="Pac-Man game · arrows to move, q to quit">
      {rows}
      <div className="text-term-dim">
        score {gs.score} · dots {gs.dots.size} · arrows/hjkl move · [q]uit
      </div>
    </div>
  );
}
