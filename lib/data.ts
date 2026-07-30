// ─────────────────────────────────────────────────────────────────────────────
// ALL site content lives in this file. Edit here, nowhere else.
// Anything marked [PLACEHOLDER] needs Shwetank's real data.
// ─────────────────────────────────────────────────────────────────────────────

export const site = {
  name: "shwetank",
  // CalVer. Bump it whenever you ship something. It's part of the joke.
  version: "2026.7.30",
  status: "stable",
  tagline:
    "Developer, builder, and CTO in Bangalore. Ships real products, end to end.",
  location: "Bangalore, India",
  education: {
    school: "Scaler School of Technology",
    program: "CS & AI",
    parallel: "BSc Hons CS, BITS Pilani",
    years: "2025–2029",
    // Terse forms for metadata rows. The curl card is a fixed 46 columns, so it
    // takes the shorter one; the sidebar can wrap and takes the full line.
    line: "scaler sst + bits pilani bs · '29",
    lineTerse: "scaler sst + bits pilani bs",
  },
  email: "shwetankg07@gmail.com",
  github: "https://github.com/shwetankg07",
  linkedin: "https://www.linkedin.com/in/shwetankg07",
  handle: "shwetankg07",
  installCmd: "yay -S shwetank",
};

// ── README (about) ───────────────────────────────────────────────────────────

export const readme = {
  paragraphs: [
    "I build products end to end, from the Postgres schema to the pixel. I've worked with early-stage startups where shipping fast and understanding the business mattered as much as the code, and that's shaped how I work: product first, stack second, ego last.",
    "Along the way I've shipped real things: I reverse-engineered my Acer laptop's keyboard controller when Linux couldn't reach it (kbrgb, now installable from the AUR and PyPI), drew all 9,298 of India's trains onto a live WebGL map (RailRaag), and published three packages to npm. Right now I'm the CTO at chalyaaar runclub, a fitness-first events platform that's small, new, and already in profit. It's all below, versioned like everything else here.",
    "I'm also going lower in the stack: learning Rust and containerization properly, because the tools I love most are the ones I understand all the way down. I do all of this from a terminal on Arch Linux, btw, inside Neovim.",
  ],
  badges: [
    { label: "build", value: "passing", tone: "green" },
    { label: "npm", value: "3 published", tone: "red" },
    { label: "hackathon", value: "top 4", tone: "red" },
    { label: "cto", value: "chalyaaar", tone: "ink" },
    { label: "rust", value: "learning", tone: "ink" },
    { label: "arch", value: "btw", tone: "ink" },
  ] as const,
};

// ── Dependencies (skills) ────────────────────────────────────────────────────
// The graph: an edge A to B means "A depends on B". `shwetank` is the root.

export type DepNode = {
  id: string;
  version: string;
  root?: boolean;
};

export const depNodes: DepNode[] = [
  { id: "shwetank", version: site.version, root: true },
  { id: "typescript", version: "^5" },
  { id: "javascript", version: "es2024" },
  { id: "python", version: "3.13" },
  { id: "react", version: "^19" },
  { id: "next.js", version: "^16" },
  { id: "node", version: "^24" },
  { id: "tailwind", version: "^4" },
  { id: "css", version: "3" },
  { id: "html", version: "5" },
  { id: "postgresql", version: "^16" },
  { id: "supabase", version: "^2" },
  { id: "rust", version: "learning" },
  { id: "docker", version: "learning" },
  { id: "java", version: "21" },
  { id: "c++", version: "23" },
  { id: "lua", version: "5.4" },
  { id: "neovim", version: "0.11" },
  { id: "arch", version: "rolling" },
  { id: "linux", version: "6.x" },
  { id: "bash", version: "5" },
  { id: "git", version: "2.x" },
];

export const depEdges: [string, string][] = [
  ["shwetank", "next.js"],
  ["shwetank", "typescript"],
  ["shwetank", "python"],
  ["shwetank", "tailwind"],
  ["shwetank", "postgresql"],
  ["shwetank", "supabase"],
  ["shwetank", "rust"],
  ["shwetank", "docker"],
  ["shwetank", "java"],
  ["shwetank", "c++"],
  ["shwetank", "neovim"],
  ["shwetank", "arch"],
  ["shwetank", "git"],
  ["shwetank", "bash"],
  ["next.js", "react"],
  ["next.js", "node"],
  ["react", "typescript"],
  ["typescript", "javascript"],
  ["node", "javascript"],
  ["tailwind", "css"],
  ["css", "html"],
  ["supabase", "postgresql"],
  ["neovim", "lua"],
  ["arch", "linux"],
  ["docker", "linux"],
  ["bash", "linux"],
];

// The flat table (also the no-JS / screen-reader version of the graph).
export type Dep = {
  name: string;
  version: string;
  kind: "dependencies" | "devDependencies" | "installing";
  note: string;
};

export const deps: Dep[] = [
  { name: "typescript", version: "^5", kind: "dependencies", note: "default dialect" },
  { name: "react", version: "^19", kind: "dependencies", note: "with next.js ^16" },
  { name: "node", version: "^24", kind: "dependencies", note: "apis, tooling, cli" },
  { name: "python", version: "3.13", kind: "dependencies", note: "reverse-engineering, data, scripts" },
  { name: "tailwind", version: "^4", kind: "dependencies", note: "you're looking at it" },
  { name: "postgresql", version: "^16", kind: "dependencies", note: "often via supabase" },
  { name: "java", version: "21", kind: "dependencies", note: "the sturdy one" },
  { name: "c++", version: "23", kind: "dependencies", note: "when speed is the feature" },
  { name: "lua", version: "5.4", kind: "dependencies", note: "neovim config, games" },
  { name: "rust", version: "2024 ed.", kind: "installing", note: "fighting the borrow checker, winning sometimes" },
  { name: "docker", version: "latest", kind: "installing", note: "containerizing everything" },
  { name: "arch linux", version: "rolling", kind: "devDependencies", note: "btw" },
  { name: "neovim", version: "0.11", kind: "devDependencies", note: "home" },
  { name: "git", version: "2.x", kind: "devDependencies", note: "commit early, push often" },
  { name: "bash", version: "5", kind: "devDependencies", note: "glue for everything" },
];

// ── Packages (projects) ──────────────────────────────────────────────────────
// The featured shelf. Everything here is real and shipped.

export type Project = {
  name: string;
  version: string;
  description: string;
  tags: string[];
  stat: string;
  statLabel: string;
  spark: number[]; // relative values, any scale, rendered as a sparkline
  links: { label: string; href: string }[];
  placeholder?: boolean;
};

export const projects: Project[] = [
  {
    name: "shwetank",
    version: "1.0.3",
    description:
      "The joke this whole site is based on, except it's real: an interactive business-card CLI published to npm. Run `npx shwetank` in any terminal and you get me.",
    tags: ["node", "npm", "cli"],
    stat: "npx shwetank",
    statLabel: "it's real",
    spark: [2, 3, 5, 4, 7, 9, 8, 12, 15, 14, 18, 22],
    links: [
      { label: "npm", href: "https://www.npmjs.com/package/shwetank" },
      { label: "source", href: "https://github.com/shwetankg07/npx-card" },
    ],
  },
  {
    name: "kbrgb",
    version: "0.2.1",
    description:
      "Reverse-engineered the Acer ENE KB5130 i2c-HID keyboard protocol on the 2025 Predator/Nitro laptops where WMI silently no-ops. One Python file, zero dependencies, 29 animated effects, and it upstreamed protocol findings of its own. Packaged for the AUR and PyPI, so anyone with the laptop can just install it.",
    tags: ["python", "reverse-engineering", "i2c-hid"],
    stat: "yay -S kbrgb",
    statLabel: "AUR + PyPI",
    spark: [1, 2, 2, 3, 4, 6, 8, 11, 14, 18, 23, 29],
    links: [
      { label: "AUR", href: "https://aur.archlinux.org/packages/kbrgb" },
      { label: "PyPI", href: "https://pypi.org/project/kbrgb/" },
      { label: "source", href: "https://github.com/shwetankg07/kbrgb" },
    ],
  },
  {
    name: "RailRaag",
    version: "1.0.0",
    description:
      "Every train in India, drawn in light. A living map in raw WebGL2 with zero runtime dependencies: 9,298 trains from 183k timetable rows, routed along real OpenStreetMap track via Dijkstra over a 612k-node graph, at ~0.3ms per frame.",
    tags: ["webgl2", "typescript", "zero-deps"],
    stat: "9,298",
    statLabel: "trains, live",
    spark: [0, 1, 3, 5, 4, 8, 12, 15, 20, 26, 32, 40],
    links: [{ label: "source", href: "https://github.com/shwetankg07/RailRaag" }],
  },
  {
    name: "chalyaaar runclub",
    version: "1.0.0",
    description:
      "A fitness-first event and run-club platform where I'm the CTO, owning the product and the stack. Small, new, and already in profit: no theater, just something people actually show up for.",
    tags: ["startup", "product", "fitness"],
    stat: "CTO",
    statLabel: "fitness, shipped",
    spark: [1, 1, 2, 3, 3, 5, 6, 8, 11, 14, 18, 23],
    // [PLACEHOLDER] add the live site URL to `links` once it's ready.
    links: [],
  },
  {
    name: "Claribb.AI",
    version: "1.0.0",
    description:
      "A multi-agent AI research workspace that remembers everything: pgvector semantic memory, plus four agents (Recall, Explorer, Critique, Connector) running in parallel on every query, with an auto-built knowledge graph. Built with a team of four.",
    tags: ["ai", "rag", "hackathon"],
    stat: "top 4",
    statLabel: "Ventures Hackathon",
    spark: [0, 6, 3, 10, 7, 14, 11, 18, 15, 22, 20, 28],
    links: [
      { label: "live", href: "https://claribb-ai.vercel.app" },
      { label: "source", href: "https://github.com/SUJALSPATEL/Claribb" },
    ],
  },
];

// ── More packages (the rest of the shelf) ────────────────────────────────────
// Compact list of real shipped work that doesn't need a full card.

export type MorePackage = { name: string; note: string; href: string };

export const morePackages: MorePackage[] = [
  {
    name: "shellmon",
    note: "a terminal pet that feeds on your dev activity. npm, zero dependencies",
    href: "https://github.com/shwetankg07/shellmon",
  },
  {
    name: "CipherDrop",
    note: "zero-knowledge file transfer: AES-256-GCM in the browser, key in the URL hash",
    href: "https://github.com/shwetankg07/CipherDrop",
  },
  {
    name: "railpull",
    note: "Indian Railways timetable toolkit, the data engine behind RailRaag",
    href: "https://github.com/shwetankg07/railpull",
  },
  {
    name: "make-npx-card",
    note: "mint your own npx <you> business card: themes, live stats, QR contacts",
    href: "https://github.com/shwetankg07/make-npx-card",
  },
  {
    name: "KeysGoBrrr",
    note: "a Monkeytype-style typing bar over any webpage. Chrome extension",
    href: "https://github.com/shwetankg07/KeysGoBrrr",
  },
];

// ── Changelog (the timeline of you) ──────────────────────────────────────────

export type Release = {
  version: string;
  date: string;
  title: string;
  notes: string[];
  breaking?: boolean;
};

export const changelog: Release[] = [
  {
    version: "v2026.7",
    date: "current",
    title: "The systems arc",
    notes: [
      "feat: kbrgb, reverse-engineered the Acer ENE KB5130 keyboard protocol",
      "feat: RailRaag, every train in India in raw WebGL2",
      "feat: learning Rust, ownership finally clicked",
      "chore: this site",
    ],
  },
  {
    version: "v2026.4",
    date: "Apr 2026",
    title: "CTO @ chalyaaar",
    notes: [
      "feat: joined chalyaaar runclub as CTO, fitness-first events",
      "feat: shipped the platform; small, new, already in profit",
    ],
  },
  {
    version: "v2026.3",
    date: "Mar 2026",
    title: "Published to npm",
    notes: [
      "feat: shipped `shwetank` to npm (npx shwetank)",
      "feat: shellmon and make-npx-card followed",
    ],
  },
  {
    version: "v2026.2",
    date: "Feb 2026",
    title: "Ventures Hackathon",
    notes: [
      "feat: built Claribb.AI with a team of 4, multi-agent research",
      "feat: top 4 finish",
    ],
  },
  {
    version: "v2025.10",
    date: "Oct 2025",
    title: "The Arch migration",
    notes: [
      "BREAKING: switched to Arch Linux. Never recovered.",
      "feat: moved into Neovim full-time",
    ],
    breaking: true,
  },
  {
    version: "v2025.8",
    date: "Aug 2025",
    title: "CS & AI @ Scaler SST",
    notes: [
      "feat: enrolled at Scaler School of Technology, Bangalore",
      "feat: 4-year residential CS & AI program",
      "feat: parallel BSc Hons in CS from BITS Pilani",
    ],
  },
  {
    version: "v0.1.0",
    date: "Jul 2025",
    title: "Initial release",
    notes: ["feat: first hello world. It printed twice. Debugging began."],
  },
];
