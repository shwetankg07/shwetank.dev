"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { site } from "@/lib/data";
import {
  runCommand,
  COMMANDS,
  CD_TARGETS,
  CAT_TARGETS,
  type ShellLine,
  type ShellApi,
} from "@/components/shell";
import { sfx, initSoundFromStorage, setSoundEnabled, soundEnabled } from "@/components/sound";
import PacmanGame from "@/components/PacmanGame";

// The hero terminal. Server-renders fully "installed" (so the content exists
// without JS), replays the install once per session on the client — and then
// the prompt becomes a real shell.

type Line =
  | { k: "cmd"; text: string }
  | { k: "out"; text: string; delay?: number }
  | { k: "dim"; text: string; delay?: number }
  | { k: "hook"; text: string; delay?: number }
  | { k: "bar"; label: string }
  | { k: "gap" };

const LINES: Line[] = [
  { k: "cmd", text: "yay -S shwetank" },
  { k: "dim", text: "resolving dependencies...", delay: 350 },
  { k: "dim", text: "checking for conflicts... none found.", delay: 450 },
  { k: "gap" },
  { k: "out", text: "Packages (2)  caffeine-9.1.0", delay: 250 },
  { k: "out", text: `              shwetank-${site.version}`, delay: 150 },
  { k: "gap" },
  { k: "out", text: "Download Size:   0.07 MiB", delay: 120 },
  { k: "out", text: "Installed Size:  one (1) developer", delay: 320 },
  { k: "gap" },
  { k: "hook", text: "Proceed? [Y/n] Y", delay: 500 },
  { k: "bar", label: "(1/2) caffeine" },
  { k: "bar", label: "(2/2) shwetank" },
  { k: "hook", text: "Running post-transaction hooks...", delay: 250 },
  { k: "dim", text: "(1/3) Mounting Bangalore, India...", delay: 300 },
  { k: "dim", text: "(2/3) Loading Neovim config...", delay: 450 },
  { k: "dim", text: "(3/3) Shipping products,", delay: 60 },
  { k: "dim", text: "      end to end...", delay: 400 },
];

const BAR_WIDTH = 16;
const LABEL_WIDTH = 16;
const HINT = "# this shell is real. try 'help' or 'neofetch'";

const TRAIN = `      ====        ________
  _D _|  |_______/        \\__I_I_____===__
   |(_)---  |   H\\________/ |   |        =
   /     |  |   H  |  |     |   |
  |      |  |   H  |__--------------------
  | ________|___H__/__|_____/[][]~\\_______
  |/ |   |-----------I_____I [][] []  D
__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___
 |/-=|___|=    ||    ||    ||    |_____/~\\
  \\_/      \\O=====O=====O=====O_/      \\_/`;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// CRT monitor mode, complete with the old TV power-on/off collapse
function toggleCrt(): boolean {
  const html = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const turningOn = !html.classList.contains("crt");
  if (turningOn) {
    html.classList.add("crt");
    if (!reduced) {
      html.classList.add("crt-power-on");
      setTimeout(() => html.classList.remove("crt-power-on"), 500);
    }
  } else if (reduced) {
    html.classList.remove("crt");
  } else {
    html.classList.add("crt-power-off");
    setTimeout(() => {
      html.classList.remove("crt", "crt-power-off");
    }, 330);
  }
  return turningOn;
}

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function InstallHero() {
  const [phase, setPhase] = useState<"done" | "playing">("done");
  const [pos, setPos] = useState({ line: LINES.length, typed: 0, bar: 100 });
  const [shellLines, setShellLines] = useState<ShellLine[]>([]);
  const [hideIntro, setHideIntro] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [gameOn, setGameOn] = useState(false);
  const [slOn, setSlOn] = useState(false);
  const slRef = useRef<HTMLPreElement>(null);
  const runId = useRef(0);
  const phaseRef = useRef(phase);
  const histRef = useRef<string[]>([]);
  const histIdx = useRef(-1);
  const konamiIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const push = useCallback((l: ShellLine | ShellLine[]) => {
    setShellLines((prev) => prev.concat(l));
  }, []);

  const finish = useCallback((completed = false) => {
    runId.current++;
    setPhase("done");
    setPos({ line: LINES.length, typed: 0, bar: 100 });
    if (completed) sfx.chime();
    try {
      sessionStorage.setItem("pacman-done", "1");
    } catch {}
    // hand the keyboard to the shell on desktop (mobile keyboards are rude)
    if (window.matchMedia("(hover: hover)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, []);

  const play = useCallback(async () => {
    const id = ++runId.current;
    setPhase("playing");
    setShellLines([]);
    setHideIntro(false);
    setPos({ line: 0, typed: 0, bar: 0 });
    for (let i = 0; i < LINES.length; i++) {
      const l = LINES[i];
      if (runId.current !== id) return;
      if (l.k === "cmd") {
        await sleep(200);
        for (let c = 1; c <= l.text.length; c++) {
          if (runId.current !== id) return;
          if (c % 2 === 0) sfx.tick();
          setPos({ line: i, typed: c, bar: 0 });
          await sleep(22);
        }
        await sleep(180);
      } else if (l.k === "bar") {
        for (let p = 0; p <= 100; p += 4) {
          if (runId.current !== id) return;
          if (p % 20 === 0) sfx.tick();
          setPos({ line: i, typed: 0, bar: p });
          await sleep(14);
        }
      } else {
        setPos({ line: i, typed: 0, bar: 0 });
        if (l.k !== "gap") await sleep(l.delay ?? 140);
      }
    }
    if (runId.current === id) finish(true);
  }, [finish]);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => {
      initSoundFromStorage();
      setSoundOn(soundEnabled());
      // plays on every page load (reduced-motion still opts out; replay/skip
      // buttons in the header, Esc to skip)
      if (!reduced) void play();
    }, 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (
        e.key === "/" &&
        phaseRef.current === "done" &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        rootRef.current?.scrollIntoView({ block: "center" });
        inputRef.current?.focus({ preventScroll: true });
      }
      // ↑↑↓↓←→←→BA
      const expected = KONAMI[konamiIdx.current];
      if (e.key === expected || e.key.toLowerCase() === expected) {
        konamiIdx.current++;
        if (konamiIdx.current === KONAMI.length) {
          konamiIdx.current = 0;
          const on = toggleCrt();
          push({
            kind: "ok",
            text: on
              ? "↑↑↓↓←→←→BA · CRT mode engaged. welcome to 1987."
              : "CRT off. konami giveth, konami taketh away.",
          });
        }
      } else {
        konamiIdx.current = e.key === KONAMI[0] ? 1 : 0;
      }
    };
    window.addEventListener("keydown", onKey);
    const id = runId;
    return () => {
      clearTimeout(t);
      id.current++;
      window.removeEventListener("keydown", onKey);
    };
  }, [play, finish, push]);

  // keep the transcript pinned to the bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [shellLines, pos, phase]);

  const api: ShellApi = {
    push,
    clear: () => {
      setHideIntro(true);
      setShellLines([]);
    },
    goto: (id) => {
      if (id === "top") window.scrollTo({ top: 0 });
      else document.getElementById(id)?.scrollIntoView();
    },
    sleep,
    nuke: async () => {
      const ids = ["readme", "dependencies", "packages", "more", "changelog", "contact"];
      sfx.thud();
      const aside = document.querySelector("aside");
      for (const sid of ids) {
        push({ kind: "err", text: `removing '${sid}/'...` });
        const el = document.getElementById(sid);
        if (el) {
          el.style.transition = "opacity 0.5s";
          el.style.opacity = "0";
        }
        await sleep(380);
      }
      if (aside) {
        aside.style.transition = "opacity 0.5s";
        aside.style.opacity = "0";
      }
      push({ kind: "err", text: "portfolio removed. hope you're happy." });
      await sleep(1600);
      push({ kind: "ok", text: "...kidding. restoring from backup:" });
      await sleep(500);
      for (const sid of [...ids].reverse()) {
        const el = document.getElementById(sid);
        if (el) el.style.opacity = "1";
        await sleep(120);
      }
      if (aside) aside.style.opacity = "1";
      sfx.chime();
      push({ kind: "ok", text: `shwetank-${site.version} restored. don't do that again.` });
    },
    sl: async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        push({ kind: "dim", text: "(the locomotive respects prefers-reduced-motion. toot.)" });
        return;
      }
      sfx.thud();
      setSlOn(true);
      await sleep(50); // let the overlay mount
      const el = slRef.current;
      const w = rootRef.current?.clientWidth ?? 640;
      if (el) {
        try {
          await el.animate(
            [
              { transform: `translateX(${w}px)` },
              { transform: "translateX(-720px)" },
            ],
            { duration: 4000, easing: "linear" }
          ).finished;
        } catch {}
      }
      setSlOn(false);
      push({ kind: "dim", text: "you have new mail: it was a typo. the train doesn't care." });
    },
    game: () => {
      setGameOn(true);
    },
    crt: () => toggleCrt(),
    gravity: async () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        push({ kind: "dim", text: "(gravity respects prefers-reduced-motion. it stays on.)" });
        return;
      }
      const els = [
        ...document.querySelectorAll<HTMLElement>(
          "section[id] > *, aside > div > *"
        ),
      ]
        .filter((el) => {
          const r = el.getBoundingClientRect();
          return r.top < window.innerHeight * 1.5 && r.bottom > -100 && r.height > 0;
        })
        .slice(0, 60);
      push({ kind: "err", text: "gravity.service: disabled. everything is falling." });
      if (els.length === 0) {
        push({ kind: "dim", text: "(scroll down a bit first, nothing on screen to drop)" });
        return;
      }
      sfx.thud();
      const anims = els.map((el) => {
        const r = el.getBoundingClientRect();
        // land on the viewport floor so the wreckage stays visible
        const d = Math.max(24, window.innerHeight - r.bottom - 6 + Math.random() * 30);
        const rot = Math.random() * 36 - 18;
        const dx = Math.random() * 80 - 40;
        return el.animate(
          [
            { transform: "translate(0, 0) rotate(0deg)" },
            {
              transform: `translate(${dx * 0.7}px, ${d}px) rotate(${rot}deg)`,
              offset: 0.5,
              easing: "cubic-bezier(0.33, 0, 0.66, 0.33)",
            },
            {
              transform: `translate(${dx * 0.85}px, ${d - d * 0.18}px) rotate(${rot * 1.15}deg)`,
              offset: 0.72,
              easing: "cubic-bezier(0.33, 0.66, 0.66, 1)",
            },
            { transform: `translate(${dx}px, ${d}px) rotate(${rot * 1.05}deg)` },
          ],
          {
            duration: 1500 + Math.random() * 700,
            delay: Math.random() * 300,
            easing: "linear",
            fill: "forwards",
          }
        );
      });
      await sleep(2800);
      push({ kind: "ok", text: "re-enabling gravity.service (in reverse, apparently)..." });
      anims.forEach((a) => {
        a.playbackRate = 1.6;
        a.reverse();
      });
      await sleep(1700);
      anims.forEach((a) => a.cancel());
      push({ kind: "ok", text: "gravity restored. nothing broke. probably." });
    },
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const cmd = input;
    setInput("");
    histIdx.current = -1;
    push({ kind: "cmd", text: cmd });
    if (cmd.trim()) histRef.current.push(cmd.trim());
    sfx.enter();
    setBusy(true);
    try {
      await runCommand(cmd, api, histRef.current);
    } finally {
      setBusy(false);
    }
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const hist = histRef.current;
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!hist.length) return;
      histIdx.current =
        histIdx.current === -1
          ? hist.length - 1
          : Math.max(0, histIdx.current - 1);
      setInput(hist[histIdx.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx.current === -1) return;
      histIdx.current++;
      if (histIdx.current >= hist.length) {
        histIdx.current = -1;
        setInput("");
      } else {
        setInput(hist[histIdx.current]);
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(/\s+/);
      const last = parts[parts.length - 1] ?? "";
      const pool =
        parts.length <= 1
          ? COMMANDS
          : parts[0] === "cd"
            ? CD_TARGETS
            : parts[0] === "cat"
              ? CAT_TARGETS
              : parts[0] === "pacman"
                ? ["-S", "-Ss", "-Qi", "-Syu"]
                : parts[0] === "sudo"
                  ? COMMANDS
                  : [];
      const matches = pool.filter((c) => c.startsWith(last) && c !== last);
      if (matches.length === 1) {
        parts[parts.length - 1] = matches[0];
        setInput(parts.join(" ") + (parts.length <= 1 ? " " : ""));
      } else if (matches.length > 1) {
        push({ kind: "dim", text: matches.join("  ") });
      }
    }
  };

  const renderLine = (l: Line, i: number) => {
    const playing = phase === "playing";
    if (playing && i > pos.line) return null;
    const partial = playing && i === pos.line;

    if (l.k === "gap") return <div key={i} className="h-4" aria-hidden />;

    if (l.k === "cmd") {
      const text = partial ? l.text.slice(0, pos.typed) : l.text;
      return (
        <div key={i}>
          <span className="text-npmred font-bold">$ </span>
          <span className="text-white font-medium">{text}</span>
          {partial && <Cursor />}
        </div>
      );
    }
    if (l.k === "bar") {
      const pct = partial ? pos.bar : 100;
      const fill = Math.round((pct / 100) * BAR_WIDTH);
      return (
        <div key={i}>
          <span>{l.label.padEnd(LABEL_WIDTH)}</span>
          <span className="text-term-dim">[</span>
          <span className="text-white">{"#".repeat(fill)}</span>
          <span className="text-term-dim">
            {"-".repeat(BAR_WIDTH - fill)}] {String(pct).padStart(3)}%
          </span>
        </div>
      );
    }
    if (l.k === "hook") {
      return (
        <div key={i}>
          <span className="text-npmred font-bold">:: </span>
          <span className="text-white">{l.text}</span>
        </div>
      );
    }
    return (
      <div key={i} className={l.k === "dim" ? "text-term-dim" : undefined}>
        {l.text}
      </div>
    );
  };

  const renderShellLine = (l: ShellLine, i: number) => {
    switch (l.kind) {
      case "cmd":
        return (
          <div key={i} className="whitespace-pre-wrap break-words">
            <span className="text-npmred font-bold">$ </span>
            <span className="text-white font-medium">{l.text}</span>
          </div>
        );
      case "err":
        return (
          <div key={i} className="whitespace-pre-wrap break-words text-[#e05d5b]">
            {l.text}
          </div>
        );
      case "ok":
        return (
          <div key={i} className="whitespace-pre-wrap break-words text-[#5fb87d]">
            {l.text}
          </div>
        );
      case "dim":
        return (
          <div key={i} className="whitespace-pre-wrap break-words text-term-dim">
            {l.text}
          </div>
        );
      case "nf":
        return (
          <div key={i} className="whitespace-pre">
            <span className="text-npmred font-bold">{l.logo}</span>
            <span>{l.info}</span>
          </div>
        );
      case "link":
        return (
          <div key={i}>
            <a href={l.href} className="underline text-white hover:text-npmred">
              {l.text}
            </a>
          </div>
        );
      default:
        return (
          <div key={i} className="whitespace-pre-wrap break-words">
            {l.text}
          </div>
        );
    }
  };

  return (
    <div
      ref={rootRef}
      className="relative min-w-0 rounded-lg border border-white/10 bg-term text-term-text shadow-[0_1px_2px_rgba(28,28,26,0.08),0_8px_24px_-12px_rgba(28,28,26,0.35)]"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <span className="size-2.5 rounded-full bg-white/15" aria-hidden />
        <span className="size-2.5 rounded-full bg-white/15" aria-hidden />
        <span className="size-2.5 rounded-full bg-npmred/80" aria-hidden />
        <span className="ml-2 font-mono text-xs text-term-dim">
          guest@{site.name} · real shell, press /
        </span>
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={() => {
              const next = !soundOn;
              setSoundEnabled(next);
              setSoundOn(next);
              if (next) sfx.chime();
            }}
            className="font-mono text-xs text-term-dim hover:text-white transition-colors"
            aria-pressed={soundOn}
          >
            sfx:{soundOn ? "on" : "off"}
          </button>
          {phase === "playing" ? (
            <button
              onClick={() => finish()}
              className="font-mono text-xs text-term-dim hover:text-white transition-colors"
            >
              skip [esc]
            </button>
          ) : (
            <button
              onClick={() => void play()}
              className="font-mono text-xs text-term-dim hover:text-white transition-colors"
            >
              replay ↻
            </button>
          )}
        </div>
      </div>
      <div
        ref={scrollRef}
        onClick={() => {
          if (window.getSelection()?.isCollapsed) {
            inputRef.current?.focus({ preventScroll: true });
          }
        }}
        className="h-[420px] sm:h-[460px] overflow-y-auto overflow-x-auto px-4 py-5 sm:px-6 font-mono text-xs sm:text-sm leading-[1.7]"
        aria-label="Interactive terminal · type 'help' for commands"
      >
        {!hideIntro && (
          <div className="whitespace-pre">{LINES.map(renderLine)}</div>
        )}
        {phase === "done" && (
          <>
            {!hideIntro && (
              <>
                <div className="h-4" aria-hidden />
                <div className="text-term-dim">{HINT}</div>
              </>
            )}
            {shellLines.map(renderShellLine)}
            {gameOn && (
              <PacmanGame
                onExit={({ score, won }) => {
                  setGameOn(false);
                  push(
                    won === null
                      ? { kind: "dim", text: `pacman exited. score: ${score}. wakawaka.` }
                      : won
                        ? [
                            { kind: "ok", text: `board cleared! score: ${score}.` },
                            { kind: "dim", text: "shwetank remains installed. the ghosts do not." },
                          ]
                        : [
                            { kind: "err", text: `a ghost got you. score: ${score}.` },
                            { kind: "dim", text: "skill issue. try again with 'pacman'." },
                          ]
                  );
                  if (window.matchMedia("(hover: hover)").matches) {
                    inputRef.current?.focus({ preventScroll: true });
                  }
                }}
              />
            )}
            <form onSubmit={submit} className={gameOn ? "hidden" : "flex items-center"}>
              <span className="text-npmred font-bold">$&nbsp;</span>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKey}
                readOnly={busy}
                className="min-w-0 flex-1 bg-transparent font-mono text-white outline-none caret-npmred placeholder:text-term-dim/60"
                placeholder="help"
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                enterKeyHint="send"
                aria-label="Shell command input"
              />
            </form>
          </>
        )}
      </div>
      {slOn && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg z-10"
          aria-hidden
        >
          <pre
            ref={slRef}
            className="absolute top-[30%] left-0 font-mono text-[11px] leading-[1.2] text-white whitespace-pre will-change-transform"
          >
            {TRAIN}
          </pre>
        </div>
      )}
    </div>
  );
}

function Cursor() {
  return (
    <span
      className="inline-block w-[0.55em] h-[1.1em] align-text-bottom bg-npmred motion-safe:animate-pulse"
      aria-hidden
    />
  );
}
