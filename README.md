<div align="center">

# `registry.shwetank.is-a.dev`

### A portfolio that ships like a package.

`shwetank`, published as a package. Browse it, `curl` it, `git clone` it, or `npx` it.
Every one of those is real.

<br>

![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)
![Output](https://img.shields.io/badge/output-static-cb3837?style=flat-square)
![npm](https://img.shields.io/npm/v/shwetank?style=flat-square&color=cb3837&label=npx%20shwetank)
![Arch](https://img.shields.io/badge/Arch-btw-1793d1?style=flat-square&logo=archlinux&logoColor=white)

**[shwetank.is-a.dev](https://shwetank.is-a.dev)**

<!-- hero shot: drop a screenshot or a short GIF of the install animation here once deployed -->

</div>

---

## Four ways to read it

```bash
firefox https://shwetank.is-a.dev        # the website
curl -L shwetank.is-a.dev                # an ANSI business card, right in your terminal
git     clone https://shwetank.is-a.dev  # yes, the domain itself is a git repo
npx     shwetank                         # the real npm package
```

No tricks behind any of them. `proxy.ts` sniffs the user agent and hands terminals the
card instead of the HTML. `scripts/build-repo.mjs` bakes a real git repository into
`public/` at build time, served over git's dumb HTTP. `npx shwetank` is a package I
actually published.

## The hero terminal is a real shell

The `yay -S shwetank` install animation plays, then the prompt becomes a working
shell. Press `/` anywhere to focus it.

`help` · `ls` · `cd <section>` · `cat PKGBUILD` · `neofetch` · `pacman -Qi shwetank`,
with tab completion and up/down history. And `sudo rm -rf /` does exactly what you'd
hope, briefly.

Undocumented, on purpose:

| try | you get |
|-----|---------|
| `pacman` (no args) | a playable ASCII Pac-Man in the terminal |
| `sl` | the steam locomotive, obviously |
| `crt`, or the Konami code | full CRT mode: scanlines, vignette, power-on flicker |
| `gravity` | everything on screen falls off the page, then floats back |
| `git log` / `git blame readme.md` | a commit history of a person |
| `cat /proc/shwetank/status` | you'll see |
| `make hire-me` | resolves one unmet dependency: your email |

## Built by hand, no libraries

- **Skills graph** is a 3D force-directed constellation: orbit camera, perspective
  projection, all hand-rolled on a 2D canvas. No three.js. A `[2d]` toggle drops it to a
  flat, draggable layout.
- **Theme toggle** wipes between light and dark as a circular reveal from the click
  point (View Transitions API), with no flash.
- **Headings** decode out of glyph noise the first time they scroll into view.
- **Scroll progress** is Pac-Man eating dots toward a ghost. At 100% he catches it.
- **Sound** is synthesized live with Web Audio. No audio files ship.

No chart library, no animation library, no gradients. A dark theme, sure, but still just
one red.

## Everything lives in one file

All content, projects, skills, changelog, links, version, sits in **`lib/data.ts`**.
Edit there, nowhere else. Bump `site.version` (CalVer) whenever you ship something. It's
part of the joke.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4, fully static output. Light and dark
themes, system preference by default, no flash on reload. Everything works without
JavaScript: the shell is server-rendered already "installed", the graph falls back to an
accessible table, and the animation respects `prefers-reduced-motion`.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # fully static, deploys to Vercel with zero config
```

---

<div align="center">
<sub>Arch, btw.</sub>
</div>
