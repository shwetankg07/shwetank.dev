// Builds a real git repository out of the site content and publishes it into
// public/ as static files, served via git's dumb HTTP protocol.
//
//   git clone https://shwetank.is-a.dev
//
// ...actually works. Runs automatically before `next build` (see "prebuild").

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { site, readme, projects, changelog, deps } = await import(
  path.join(root, "lib/data.ts")
);

const work = path.join(root, ".repo-build");
const pub = path.join(root, "public");

const git = (...args) =>
  execFileSync("git", args, {
    cwd: work,
    stdio: "pipe",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: site.name,
      GIT_AUTHOR_EMAIL: site.email,
      GIT_COMMITTER_NAME: site.name,
      GIT_COMMITTER_EMAIL: site.email,
    },
  });

const write = (rel, content) => {
  const p = path.join(work, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
};

// ── fresh workspace ──────────────────────────────────────────────────────────
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });
git("init", "-q", "-b", "main");

// ── commit 1: hello world ────────────────────────────────────────────────────
write(
  "README.md",
  `# shwetank\n\nhello world\n\n(it printed twice. debugging began.)\n`
);
git("add", "-A");
git("commit", "-q", "-m", "feat: initial release — hello world");

// ── one commit per changelog release, oldest first ───────────────────────────
let changelogMd = `# Changelog\n\nAll notable changes to this developer.\n`;
for (const r of [...changelog].reverse()) {
  changelogMd += `\n## ${r.version} — ${r.title} (${r.date})\n\n`;
  for (const n of r.notes) changelogMd += `- ${n}\n`;
  write("CHANGELOG.md", changelogMd);
  git("add", "-A");
  git("commit", "-q", "-m", `release: ${r.version} — ${r.title.toLowerCase()}`);
}

// ── final commit: the whole package ──────────────────────────────────────────
write(
  "README.md",
  [
    `# ${site.name}`,
    "",
    `> ${site.tagline}`,
    "",
    "You just cloned a human. Congratulations on your excellent taste in protocols.",
    "",
    ...readme.paragraphs.map((p) => p + "\n"),
    "## Education",
    "",
    `- ${site.education.school}, Bangalore · ${site.education.program} · ${site.education.years}`,
    `- ${site.education.parallel} (parallel)`,
    "",
    "## Links",
    "",
    `- github: ${site.github}`,
    `- linkedin: ${site.linkedin}`,
    `- email: ${site.email}`,
    `- try: \`npx shwetank\` (real npm package)`,
    `- website: the thing you cloned this from`,
    "",
  ].join("\n")
);
write(
  "PKGBUILD",
  [
    `# Maintainer: ${site.name} <${site.email}>`,
    `pkgname=${site.name}`,
    `pkgver=${site.version}`,
    `pkgrel=1`,
    `pkgdesc="Developer, student, builder. Ships real products."`,
    `arch=('any')`,
    `url="${site.github}"`,
    `license=('curiosity')`,
    `depends=('typescript' 'react' 'postgresql' 'caffeine')`,
    `makedepends=('arch-linux' 'neovim' 'git')`,
    ``,
    `build() {`,
    `  cd "$srcdir"`,
    `  ship --products --fast --end-to-end`,
    `}`,
    ``,
  ].join("\n")
);
write(
  "package.json",
  JSON.stringify(
    {
      name: site.name,
      version: site.version,
      description: site.tagline,
      license: "curiosity",
      repository: "https://shwetank.is-a.dev",
      dependencies: Object.fromEntries(
        deps
          .filter((d) => d.kind === "dependencies")
          .map((d) => [d.name.replace(/\s+/g, "-"), d.version])
      ),
      devDependencies: Object.fromEntries(
        deps
          .filter((d) => d.kind === "devDependencies")
          .map((d) => [d.name.replace(/\s+/g, "-"), d.version])
      ),
      engines: { node: ">=24", caffeine: ">=2.0" },
    },
    null,
    2
  ) + "\n"
);
for (const p of projects) {
  const slug = p.name.replace(/\s+/g, "-");
  write(
    `packages/${slug}.md`,
    [
      `# ${p.name} v${p.version}`,
      "",
      p.description,
      "",
      `- ${p.statLabel}: ${p.stat}`,
      `- tags: ${p.tags.join(", ")}`,
      ...p.links.map((l) => `- ${l.label}: ${l.href}`),
      "",
    ].join("\n")
  );
}
git("add", "-A");
git("commit", "-q", "-m", `release: ${site.name}@${site.version}`);
git("update-server-info");

// ── publish .git into public/ for dumb-HTTP cloning ─────────────────────────
for (const f of ["HEAD", "info", "objects", "refs"]) {
  fs.rmSync(path.join(pub, f), { recursive: true, force: true });
  fs.cpSync(path.join(work, ".git", f), path.join(pub, f), { recursive: true });
}
fs.rmSync(work, { recursive: true, force: true });

console.log(
  `clonable repo published to public/ (${changelog.length + 2} commits)`
);
