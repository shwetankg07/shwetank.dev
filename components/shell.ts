// The shell behind the hero terminal. Pure command engine — the component
// feeds it input and renders whatever it pushes back.

import { site, deps, projects, readme, changelog } from "@/lib/data";

export type ShellLine =
  | { kind: "cmd"; text: string }
  | { kind: "out" | "dim" | "err" | "ok"; text: string }
  | { kind: "nf"; logo: string; info: string }
  | { kind: "link"; text: string; href: string };

export type ShellApi = {
  push: (l: ShellLine | ShellLine[]) => void;
  clear: () => void;
  goto: (id: string) => void;
  nuke: () => Promise<void>;
  sleep: (ms: number) => Promise<void>;
  /** the sacred steam locomotive */
  sl: () => Promise<void>;
  /** launch ASCII Pac-Man in the terminal */
  game: () => void;
  /** toggle CRT monitor mode; returns the new state */
  crt: () => boolean;
  /** turn gravity off for everything on screen, then apologize */
  gravity: () => Promise<void>;
};

const SECTIONS: Record<string, string> = {
  readme: "readme",
  about: "readme",
  dependencies: "dependencies",
  deps: "dependencies",
  skills: "dependencies",
  packages: "packages",
  projects: "packages",
  work: "packages",
  more: "more",
  changelog: "changelog",
  contact: "contact",
  "~": "top",
  home: "top",
  top: "top",
};

export const COMMANDS = [
  "help",
  "ls",
  "cd",
  "cat",
  "neofetch",
  "whoami",
  "pacman",
  "man",
  "git",
  "make",
  "systemctl",
  "journalctl",
  "echo",
  "pwd",
  "uname",
  "history",
  "clear",
  "sudo",
  "rm",
  "vim",
  "exit",
];

export const CD_TARGETS = Object.keys(SECTIONS).filter((s) => s !== "~");
export const CAT_TARGETS = [
  "PKGBUILD",
  "readme.md",
  "/proc/shwetank/status",
  "/proc/meminfo",
  "/proc/loadavg",
  "/proc/uptime",
];

const PKGBUILD = [
  `# Maintainer: shwetank <${site.email}>`,
  `pkgname=shwetank`,
  `pkgver=${site.version}`,
  `pkgrel=1`,
  `pkgdesc="Developer, student, builder. Ships real products."`,
  `arch=('any')`,
  `url="${site.github}"`,
  `license=('curiosity')`,
  `depends=('typescript' 'react' 'postgresql' 'caffeine')`,
  `makedepends=('arch-linux' 'neovim' 'git')`,
  `optdepends=('rust: the systems arc'`,
  `            'docker: containers everywhere')`,
  `source=("bangalore.tar.gz")`,
  ``,
  `build() {`,
  `  cd "$srcdir"`,
  `  ship --products --fast --end-to-end`,
  `}`,
];

// Small Arch logo, padded to constant width so the info column lines up.
const NF_LOGO = [
  "       /\\        ",
  "      /  \\       ",
  "     /\\   \\      ",
  "    /  __  \\     ",
  "   /  (  )  \\    ",
  "  / __|  |__ \\   ",
  " /.`        `.\\  ",
  "                 ",
];

const NF_INFO = [
  `guest@${site.name}.dev`,
  `─────────────────`,
  `OS: Arch Linux x86_64 (btw)`,
  `Host: Bangalore, India`,
  `Shell: this website`,
  `Editor: Neovim 0.11`,
  `Packages: ${projects.length} shipped, more brewing`,
  `Status: ${site.status} · open to interesting work`,
];

const dim = (text: string): ShellLine => ({ kind: "dim", text });
const out = (text: string): ShellLine => ({ kind: "out", text });
const err = (text: string): ShellLine => ({ kind: "err", text });
const ok = (text: string): ShellLine => ({ kind: "ok", text });

// deterministic fake commit hash from a string
const fakeHash = (s: string) => {
  let h = 0x811c9dc5;
  for (const c of s) h = ((h ^ c.charCodeAt(0)) * 0x01000193) >>> 0;
  return h.toString(16).padStart(8, "0").slice(0, 7);
};

const PROC: Record<string, string[]> = {
  "/proc/shwetank/status": [
    "Name:           shwetank",
    "State:          S (studying)",
    "Tgid:           1",
    "Threads:        too many",
    "Cpus_allowed:   all, simultaneously",
    "VmPeak:         hackathon season",
    "Seccomp:        disabled (will try anything once)",
  ],
  "/proc/meminfo": [
    "MemTotal:        enough kB",
    "MemFree:         low",
    "Cached:          rust ownership rules",
    "Buffers:         3 side projects",
    "SwapTotal:       chai, occasionally",
    "Dirty:           the neovim config, always",
  ],
  "/proc/loadavg": ["2.56 1.87 0.42 3/141 2007   # spikes during exam season"],
};

export async function runCommand(raw: string, api: ShellApi, history: string[]) {
  const input = raw.trim();
  if (!input) return;

  let words = input.split(/\s+/);
  let elevated = false;
  if (words[0] === "sudo") {
    elevated = true;
    words = words.slice(1);
    if (words.length === 0) {
      api.push(out("usage: sudo <command>"));
      return;
    }
  }
  const [cmd, ...args] = words;

  switch (cmd) {
    case "help":
      api.push([
        out("available commands:"),
        out("  ls              see what's here"),
        out("  cd <section>    jump around (cd projects, cd contact)"),
        out("  cat PKGBUILD    how this package is built"),
        out("  neofetch        you know you want to"),
        out("  pacman -Qi shwetank    package details"),
        out("  whoami · man shwetank · clear · history"),
        dim("  (tab completes, arrows recall history)"),
        dim("  (undocumented commands exist. typos too. real"),
        dim("   terminals have secrets. /proc is a good start)"),
      ]);
      return;

    case "ls":
      api.push([
        out("readme/  dependencies/  packages/  more/  changelog/  contact/"),
        out("PKGBUILD  readme.md"),
      ]);
      return;

    case "cd": {
      const target = (args[0] ?? "~").replace(/\/$/, "").toLowerCase();
      const id = SECTIONS[target];
      if (id) {
        api.goto(id);
        api.push(dim(`→ ${id === "top" ? "~" : id + "/"}`));
      } else {
        api.push(err(`cd: no such directory: ${args[0]} (try 'ls')`));
      }
      return;
    }

    case "cat": {
      const f = args[0] ?? "";
      if (f === "PKGBUILD") {
        api.push(PKGBUILD.map(dim));
        return;
      }
      if (f.toLowerCase() === "readme.md" || f.toLowerCase() === "readme") {
        api.goto("readme");
        api.push(dim("→ rendering readme/ below (scroll down)"));
        return;
      }
      if (PROC[f]) {
        api.push(PROC[f].map(out));
        return;
      }
      if (f === "/proc/uptime") {
        const secs = Math.floor((Date.now() - Date.UTC(2007, 0, 4)) / 1000);
        api.push([
          out(`${secs}.42 0.00`),
          dim("# seconds since first boot. zero idle time, obviously."),
        ]);
        return;
      }
      if (f === "/proc" || f.startsWith("/proc")) {
        api.push([
          err(`cat: ${f}: is a directory (or classified)`),
          dim("try: status meminfo loadavg uptime (under /proc/shwetank or /proc)"),
        ]);
        return;
      }
      api.push(err(f ? `cat: ${f}: no such file` : "cat: missing operand"));
      return;
    }

    case "git": {
      const sub = args[0] ?? "";
      if (sub === "clone") {
        api.push([
          out("fatal: wrong terminal."),
          ok("this actually works in a real one:"),
          out("  git clone https://shwetank.is-a.dev"),
          dim("(yes, the domain itself is a git repo. go on, try it.)"),
        ]);
        return;
      }
      if (sub === "log") {
        api.push(
          changelog.map((r) =>
            out(`${fakeHash(r.version)} (${r.version}) ${r.title.toLowerCase()}`)
          )
        );
        api.push(dim("# full history: git clone https://shwetank.is-a.dev"));
        return;
      }
      if (sub === "blame") {
        api.push(
          readme.paragraphs.map((p, i) => {
            const r = changelog[Math.min(i + 1, changelog.length - 1)];
            return dim(
              `^${fakeHash(p)} (shwetank ${r.version}) ${p.slice(0, 48)}...`
            );
          })
        );
        return;
      }
      if (sub === "status") {
        api.push([
          out("On branch main"),
          out("Your branch is ahead of 'tutorial-hell' by 847 commits."),
          out("nothing to commit, everything ships clean"),
        ]);
        return;
      }
      if (sub === "push") {
        api.push(
          args.includes("--force")
            ? err("error: --force on main? absolutely not. we use --force-with-lease here.")
            : ok("Everything up-to-date. it usually is.")
        );
        return;
      }
      api.push([
        out(`git: '${sub || "?"}'. try: clone log blame status push`),
      ]);
      return;
    }

    case "systemctl": {
      const unit = args.filter((a) => a !== "status").pop() ?? "";
      if (unit === "career.service" || unit === "career") {
        api.push([
          ok("● career.service - Shipping products since the startup years"),
          out("     Loaded: loaded (/home/shwetank/drive.service; enabled)"),
          out(`     Active: active (running); v${site.version}`),
          out("     Memory: product-first, stack second, ego last"),
          out("     CGroup: └─ 1 developer, several side projects"),
        ]);
        return;
      }
      if (unit.startsWith("rust")) {
        api.push([
          out("● rust-learning.service - The Systems Arc"),
          out("     Active: activating (start), negotiating with borrow checker"),
          dim("     Progress: ownership ✓  lifetimes ✓  async... loading"),
        ]);
        return;
      }
      if (unit.startsWith("sleep")) {
        api.push([
          err("○ sleep.timer - inactive (dead)"),
          dim("     Cause: disabled during hackathons. never re-enabled."),
        ]);
        return;
      }
      api.push([
        out("UNIT                    ACTIVE      DESCRIPTION"),
        out("career.service          active      shipping products"),
        out("rust-learning.service   activating  the systems arc"),
        out("sleep.timer             dead        we don't talk about it"),
        dim("try: systemctl status <unit>"),
      ]);
      return;
    }

    case "journalctl": {
      api.push(
        changelog
          .slice()
          .reverse()
          .flatMap((r) =>
            r.notes.map((n) =>
              dim(`${r.version} shwetank systemd[1]: ${n}`)
            )
          )
      );
      return;
    }

    case "make": {
      const target = args[0] ?? "";
      if (target === "hire-me" || target === "hire") {
        api.push([
          out("make: resolving dependency graph..."),
          out("  cc -O2 skills.o projects.o caffeine.o -o interview"),
          out("  ld: linking real-world experience... done"),
          ok("interview: ready."),
          err("make: *** one unresolved dependency: your email."),
        ]);
        await api.sleep(600);
        api.goto("contact");
        api.push(dim("→ contact/ (make fixed it for you)"));
        return;
      }
      api.push(
        target
          ? err(`make: *** No rule to make target '${target}'. Stop.`)
          : out("make: try 'make hire-me'")
      );
      return;
    }

    case "sl":
      await api.sl();
      return;

    case "crt": {
      const on = api.crt();
      api.push(
        on
          ? [
              ok("CRT engaged. phosphor warm-up complete."),
              dim("(curvature not included, your monitor is too good)"),
            ]
          : ok("back to boring flat pixels.")
      );
      return;
    }

    case "gravity":
      await api.gravity();
      return;

    case "neofetch": {
      const rows = Math.max(NF_LOGO.length, NF_INFO.length);
      const lines: ShellLine[] = [];
      for (let i = 0; i < rows; i++) {
        lines.push({
          kind: "nf",
          logo: NF_LOGO[i] ?? " ".repeat(17),
          info: NF_INFO[i] ?? "",
        });
      }
      api.push(lines);
      return;
    }

    case "whoami":
      api.push([
        out("guest, welcome."),
        out(`the maintainer is ${site.name} (${site.location.toLowerCase()}).`),
        dim("try 'cd contact' to reach him."),
      ]);
      return;

    case "pacman": {
      const flag = args[0] ?? "";
      if (!flag) {
        // no args. you know exactly what happens now.
        api.game();
        return;
      }
      if (flag === "-Syu") {
        api.push([
          dim(":: Synchronizing package databases..."),
          out("shwetank is up to date. always shipping."),
        ]);
        return;
      }
      if (flag === "-Qi") {
        api.push([
          out(`Name          : ${site.name}`),
          out(`Version       : ${site.version}`),
          out(`Description   : ${site.tagline}`),
          out(`URL           : ${site.github}`),
          out(
            `Education     : ${site.education.school} (${site.education.program}) · ${site.education.parallel}`,
          ),
          out(`Licenses      : curiosity`),
          out(`Depends On    : typescript react postgresql caffeine`),
          out(`Optional Deps : rust [installing] docker [installing]`),
          out(`Conflicts With: vaporware`),
          out(`Install Reason: explicitly requested (good taste)`),
        ]);
        return;
      }
      if (flag === "-Ss") {
        const q = args.slice(1).join(" ").toLowerCase();
        if (!q) {
          api.push(err("usage: pacman -Ss <query>"));
          return;
        }
        const hits: ShellLine[] = [];
        for (const d of deps)
          if (d.name.includes(q) || d.note.includes(q))
            hits.push(out(`deps/${d.name} ${d.version} · ${d.note}`));
        for (const p of projects)
          if (p.name.includes(q) || p.description.toLowerCase().includes(q))
            hits.push(out(`packages/${p.name} v${p.version} · ${p.statLabel}: ${p.stat}`));
        api.push(hits.length ? hits : err(`error: no results for '${q}'`));
        return;
      }
      if (flag === "-R") {
        api.push(
          err(
            `error: failed to prepare transaction: '${args[1] ?? "shwetank"}' is required by 'this-website'`
          )
        );
        return;
      }
      if (flag === "-S") {
        const t = args[1] ?? "";
        if (!t) {
          api.push(err("error: no targets specified (use -h for help)"));
          return;
        }
        if (t === "shwetank") {
          api.push([
            dim(`warning: shwetank-${site.version} is up to date -- reinstalling`),
            ok("already installed. already yours. cd contact to hire."),
          ]);
          return;
        }
        api.push(err(`error: target not found: ${t}`));
        return;
      }
      api.push([
        out("usage: pacman <-S|-Ss|-Qi|-Syu|-R> [target]"),
        dim("       pacman (no args), you'll see"),
      ]);
      return;
    }

    case "man":
      if ((args[0] ?? "shwetank") === "shwetank") {
        api.goto("readme");
        api.push(dim("→ opening SHWETANK(1) below"));
      } else {
        api.push(err(`No manual entry for ${args[0]}`));
      }
      return;

    case "echo":
      api.push(out(args.join(" ")));
      return;

    case "pwd":
      api.push(out("/home/guest/shwetank"));
      return;

    case "uname":
      api.push(out(`Linux shwetank ${site.version}-arch1 #1 SMP BLR x86_64 GNU/Linux`));
      return;

    case "history":
      api.push(
        history.length
          ? history.map((h, i) => dim(`  ${String(i + 1).padStart(3)}  ${h}`))
          : dim("(empty, you just got here)")
      );
      return;

    case "clear":
      api.clear();
      return;

    case "rm": {
      const isNuke = args.includes("-rf") || args.includes("-fr");
      const target = args.find((a) => !a.startsWith("-"));
      if (!elevated) {
        api.push(err(`rm: cannot remove '${target ?? "/"}': permission denied (try harder)`));
        return;
      }
      if (isNuke && (target === "/" || target === "/*" || target === "*")) {
        await api.nuke();
        return;
      }
      api.push(err(`rm: cannot remove '${target ?? ""}': no such file or directory`));
      return;
    }

    case "vim":
    case "nvim":
    case "neovim":
      api.push([
        out("already inside a config that took 3 years to perfect."),
        dim("(the browser will have to do for now)"),
      ]);
      return;

    case "exit":
    case ":q":
    case ":q!":
    case ":wq":
    case "q":
      api.push([
        err("you can't quit the internet."),
        dim("try 'cd contact' instead, much better exit strategy."),
      ]);
      return;

    case "arch":
      api.push(out("btw"));
      return;

    default:
      if (elevated) {
        api.push([
          err(`guest is not in the sudoers file.`),
          dim("this incident will be reported (to no one)."),
        ]);
        return;
      }
      api.push([
        err(`bash: ${cmd}: command not found`),
        dim("try 'help'"),
      ]);
  }
}
