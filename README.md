# registry.shwetank.dev

Personal portfolio styled as a package registry: `shwetank`, published as a
package. `pacman -S shwetank` install animation in the hero, skills as an
interactive dependency graph, projects as packages with stats, life as a
changelog.

Four ways to read it:

```bash
firefox https://shwetank.dev          # the website
curl shwetank.dev                     # ANSI card (proxy.ts + app/card)
git clone https://shwetank.dev        # the domain is a git repo (scripts/build-repo.mjs)
npx shwetank                          # the real npm package
```

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # fully static — deploys to Vercel with zero config
```

## Edit content

Everything lives in **`lib/data.ts`** — projects, skills, changelog, links,
version number. Search for `[PLACEHOLDER]` to find what still needs real data:

- The four projects in `projects` (names, descriptions, stats, links)
- Changelog dates and specifics
- One line of the README paragraphs (startup + npm package specifics)
- `metadataBase` in `app/layout.tsx` (set the real domain)

Bump `site.version` (CalVer) whenever you ship something.

## The shell is real

After the install animation, the hero terminal becomes a working shell
(press `/` anywhere to focus it). Commands live in `components/shell.ts`:
`help`, `ls`, `cd <section>`, `cat PKGBUILD`, `neofetch`, `pacman -Qi
shwetank`, tab completion, ↑/↓ history — and `sudo rm -rf /` does exactly
what you'd hope, briefly.

Undocumented, by design: `sl` (typo the classic way), `pacman` with no args
(playable ASCII Pac-Man, arrows/hjkl, q quits), `cat /proc/shwetank/status`,
`cat /proc/meminfo`, `git log` / `git blame readme.md` / `git status`,
`systemctl status sleep.timer`, `journalctl`, `make hire-me`, `crt` (full
CRT-monitor mode with power-on/off collapse; the Konami code also works),
and `gravity` (everything on screen falls off the page, then floats back).

## Visual layer

- Skills graph is a 3D constellation: force-directed layout in three
  dimensions, orbit camera, perspective projection — hand-rolled on 2D
  canvas, no three.js. `[2d]` toggle for the flat draggable version.
- Theme toggle does a circular wipe from the click point (View Transitions
  API, graceful fallback).
- Headings decode out of glyph noise on first scroll into view.
- The scroll progress bar is Pac-Man eating dots toward a ghost; at 100%
  he catches it.

## How it's built

- Next.js (App Router) + TypeScript + Tailwind v4, fully static output
  (page, 404, and the OG image are all prerendered)
- Light + dark themes: system preference by default, `--dark`/`--light`
  toggle in the top bar, persisted, no flash on reload
- Hero terminal replays the install once per session; skippable with Esc;
  respects `prefers-reduced-motion`; full content is server-rendered so the
  page works without JS
- Dependency graph is a hand-rolled force simulation on canvas (draggable,
  hover to trace edges, theme-aware); the table below it is the
  accessible/no-JS version
- Optional synthesized sound effects (Web Audio, `sfx:off` by default in the
  terminal header)
- No chart libraries, no animation libraries, no dark gradients — dark
  *theme*, sure, but still one red
