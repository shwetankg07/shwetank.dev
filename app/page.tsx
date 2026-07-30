import InstallHero from "@/components/InstallHero";
import DepGraph from "@/components/DepGraph";
import Sparkline from "@/components/Sparkline";
import CopyButton from "@/components/CopyButton";
import TabBar from "@/components/TabBar";
import ThemeToggle from "@/components/ThemeToggle";
import Uptime from "@/components/Uptime";
import Decode from "@/components/Decode";
import {
  site,
  readme,
  deps,
  projects,
  morePackages,
  changelog,
  type Dep,
} from "@/lib/data";

export default function Home() {
  return (
    <>
      <TopBar />
      <main className="flex-1">
        <Hero />
        <TabBar />
        <div className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12">
          <div className="min-w-0">
            <Readme />
            <Dependencies />
            <Packages />
            <MorePackages />
            <Changelog />
            <Contact />
          </div>
          <Sidebar />
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── chrome ───────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <header className="border-b border-hairline">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2 font-mono text-sm font-bold">
          <span className="grid place-items-center size-6 rounded bg-npmred text-white text-xs">
            s
          </span>
          <span>
            <span className="hidden min-[480px]:inline">registry.</span>
            {site.name}
            <span className="text-muted">.is-a.dev</span>
          </span>
        </a>
        <nav className="flex items-center gap-4 font-mono text-xs sm:text-sm">
          <a
            className="whitespace-nowrap text-muted hover:text-npmred transition-colors"
            href={site.github}
          >
            github<span aria-hidden>&nbsp;↗</span>
          </a>
          <a
            className="whitespace-nowrap text-muted hover:text-npmred transition-colors"
            href={site.linkedin}
          >
            linkedin<span aria-hidden>&nbsp;↗</span>
          </a>
          <a
            className="hidden sm:inline text-muted hover:text-npmred transition-colors"
            href={`mailto:${site.email}`}
          >
            email
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <div
      id="top"
      className="mx-auto max-w-6xl px-4 sm:px-6 py-10 sm:py-16 grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center"
    >
      <div>
        <p className="font-mono text-xs text-muted mb-4">
          registry / packages / <span className="text-ink">{site.name}</span>
        </p>
        <h1 className="font-mono font-extrabold tracking-tight text-5xl sm:text-6xl">
          <Decode text={site.name} />
          <span className="text-npmred motion-safe:animate-pulse" aria-hidden>
            ▌
          </span>
        </h1>
        <p className="mt-4 font-mono text-sm flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <span className="text-ink font-semibold">v{site.version}</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-stable" aria-hidden />
            {site.status}
          </span>
          <span>{site.location.toLowerCase()}</span>
        </p>
        <p className="mt-6 text-lg sm:text-xl leading-relaxed max-w-md text-ink">
          {site.tagline}
        </p>
        <div className="mt-8 flex items-center gap-3 max-w-md rounded-lg border border-hairline bg-faint px-4 py-3">
          <code className="font-mono text-sm flex-1 overflow-x-auto whitespace-nowrap">
            <span className="text-npmred font-bold">$ </span>
            {site.installCmd}
          </code>
          <CopyButton text={site.installCmd} />
        </div>
      </div>
      <InstallHero />
    </div>
  );
}

function SectionHeading({ file, title }: { file: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-6">
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
        <Decode text={title} />
      </h2>
      <span className="font-mono text-xs text-muted">{file}</span>
    </div>
  );
}

// ── sections ─────────────────────────────────────────────────────────────────

function Readme() {
  return (
    <section id="readme" className="pt-12 sm:pt-16">
      <SectionHeading title="About" file="README.md" />
      <div className="flex flex-wrap gap-2 mb-8">
        {readme.badges.map((b) => (
          <Badge key={b.label} {...b} />
        ))}
      </div>
      <div className="space-y-5 text-[17px] leading-relaxed max-w-2xl">
        {readme.paragraphs.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </section>
  );
}

function Badge({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "green" | "red" | "ink";
}) {
  // fixed colors on purpose — badges read like shields.io images in both themes
  const tones = {
    green: "bg-[#2e7d4f]",
    red: "bg-[#cb3837]",
    ink: "bg-[#40403c]",
  } as const;
  return (
    <span className="inline-flex font-mono text-xs rounded overflow-hidden">
      <span className="bg-[#55544e] text-white px-2 py-1">{label}</span>
      <span className={`${tones[tone]} text-white px-2 py-1`}>{value}</span>
    </span>
  );
}

function Dependencies() {
  const kinds: Dep["kind"][] = ["dependencies", "devDependencies", "installing"];
  return (
    <section id="dependencies" className="pt-16 sm:pt-20">
      <SectionHeading title="Skills" file="package.json → dependencies" />
      <DepGraph />
      <noscript>
        <style>{`.dep-graph{display:none}`}</style>
      </noscript>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left font-mono text-xs text-muted border-b border-hairline">
              <th className="py-2 pr-4 font-normal">package</th>
              <th className="py-2 pr-4 font-normal">version</th>
              <th className="py-2 pr-4 font-normal hidden sm:table-cell">type</th>
              <th className="py-2 font-normal">notes</th>
            </tr>
          </thead>
          <tbody>
            {kinds.flatMap((kind) =>
              deps
                .filter((d) => d.kind === kind)
                .map((d) => (
                  <tr key={d.name} className="border-b border-hairline">
                    <td className="py-2.5 pr-4 font-mono font-semibold whitespace-nowrap">
                      {d.name}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-muted whitespace-nowrap">
                      {d.version}
                    </td>
                    <td className="py-2.5 pr-4 hidden sm:table-cell">
                      <span
                        className={`font-mono text-xs px-1.5 py-0.5 rounded ${
                          d.kind === "installing"
                            ? "bg-npmred text-white"
                            : "bg-faint text-muted"
                        }`}
                      >
                        {d.kind === "installing" ? "installing…" : d.kind}
                      </span>
                    </td>
                    <td className="py-2.5 text-muted">{d.note}</td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Packages() {
  return (
    <section id="packages" className="pt-16 sm:pt-20">
      <SectionHeading title="Work" file={`packages/ (${projects.length})`} />
      <div className="divide-y divide-hairline border-y border-hairline">
        {projects.map((p) => (
          <article
            key={p.name}
            className="py-7 sm:grid sm:grid-cols-[minmax(0,1fr)_150px] sm:gap-8"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-mono text-lg font-bold">
                  <a
                    href={p.links[0]?.href}
                    className="hover:text-npmred transition-colors"
                  >
                    {p.name}
                  </a>
                </h3>
                <span className="font-mono text-xs text-muted">v{p.version}</span>
                {p.placeholder && (
                  <span className="font-mono text-[10px] uppercase tracking-wide bg-faint border border-hairline text-muted px-1.5 py-0.5 rounded">
                    placeholder
                  </span>
                )}
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-ink/90 max-w-xl">
                {p.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((t) => (
                    <span
                      key={t}
                      className="font-mono text-xs bg-faint text-muted px-1.5 py-0.5 rounded"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex gap-3 font-mono text-xs">
                  {p.links.map((l) => (
                    <a
                      key={l.label}
                      href={l.href}
                      className="text-npmred hover:text-npmred-dark underline decoration-npmred/30 underline-offset-2"
                    >
                      {l.label}
                      <span aria-hidden> ↗</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 sm:mt-1 flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1">
              <Sparkline data={p.spark} className="text-muted" />
              <div className="sm:text-right">
                <span className="font-mono font-bold text-lg">{p.stat}</span>{" "}
                <span className="font-mono text-xs text-muted">{p.statLabel}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function MorePackages() {
  return (
    <section id="more" className="pt-16 sm:pt-20">
      <SectionHeading title="More" file={`more-packages/ (${morePackages.length})`} />
      <ul className="divide-y divide-hairline border-y border-hairline">
        {morePackages.map((p) => (
          <li key={p.name}>
            <a
              href={p.href}
              className="group flex flex-col gap-0.5 py-3.5 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="font-mono text-sm font-semibold whitespace-nowrap group-hover:text-npmred transition-colors">
                {p.name}
                <span aria-hidden className="text-muted"> ↗</span>
              </span>
              <span className="text-[14px] leading-snug text-muted">{p.note}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Changelog() {
  return (
    <section id="changelog" className="pt-16 sm:pt-20">
      <SectionHeading title="Changelog" file="CHANGELOG.md" />
      <ol className="relative border-l border-hairline ml-1.5 space-y-10">
        {changelog.map((r, i) => (
          <li key={r.version} className="pl-6 relative">
            <span
              className={`absolute -left-[5px] top-1.5 size-2.5 rounded-full ${
                i === 0 ? "bg-npmred" : "bg-hairline"
              }`}
              aria-hidden
            />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono font-bold">{r.version}</span>
              <span className="font-semibold">{r.title}</span>
              <span className="font-mono text-xs text-muted">{r.date}</span>
            </div>
            <ul className="mt-2 space-y-1 font-mono text-[13px] leading-relaxed">
              {r.notes.map((n) => {
                const idx = n.indexOf(":");
                const prefix = idx > 0 ? n.slice(0, idx) : "";
                const rest = idx > 0 ? n.slice(idx + 1) : n;
                return (
                  <li key={n} className="text-ink/90">
                    <span
                      className={
                        prefix === "BREAKING"
                          ? "text-npmred font-bold"
                          : "text-muted"
                      }
                    >
                      {prefix}
                      {prefix && ":"}
                    </span>
                    {rest}
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="pt-16 sm:pt-20">
      <SectionHeading title="Contact" file="issues/new" />
      <div className="rounded-lg border border-hairline overflow-hidden max-w-2xl">
        <div className="bg-faint px-5 py-2.5 font-mono text-xs text-muted border-b border-hairline">
          new issue · maintainer usually responds fast
        </div>
        <div className="p-6 sm:p-8">
          <h3 className="text-xl font-bold tracking-tight">
            Building something real? Let&apos;s talk.
          </h3>
          <p className="mt-3 text-[15px] leading-relaxed text-ink/90 max-w-md">
            Open to interesting work: products that need shipping, teams that
            move fast, or a good conversation about Rust, terminals, and why
            Arch is worth it.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${site.email}`}
              className="font-mono text-sm bg-npmred hover:bg-npmred-dark text-white px-4 py-2.5 rounded transition-colors"
            >
              open an issue → email
            </a>
            <a
              href={site.github}
              className="font-mono text-sm border border-hairline hover:border-npmred hover:text-npmred px-4 py-2.5 rounded transition-colors"
            >
              github ↗
            </a>
            <a
              href={site.linkedin}
              className="font-mono text-sm border border-hairline hover:border-npmred hover:text-npmred px-4 py-2.5 rounded transition-colors"
            >
              linkedin ↗
            </a>
          </div>
          <p className="mt-5 font-mono text-xs text-muted">
            {site.email} · {site.location.toLowerCase()}
          </p>
        </div>
      </div>
    </section>
  );
}

// ── sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  const rows: [string, React.ReactNode][] = [
    [
      "repository",
      <a key="r" href={site.github} className="hover:text-npmred">
        github.com/{site.handle}
      </a>,
    ],
    ["homepage", "you're on it"],
    ["location", site.location.toLowerCase()],
    ["education", site.education.line],
    ["uptime", <Uptime key="u" />],
    ["runtime", "arch linux + neovim"],
    ["engines", "node ≥24 · caffeine ≥2.0"],
    ["unpacked size", "one (1) developer"],
    ["vulnerabilities", "0 known"],
    ["license", "open to interesting work"],
  ];
  return (
    <aside className="hidden lg:block pt-16">
      <div className="sticky top-16 space-y-8">
        <div>
          <h2 className="font-mono text-xs text-muted mb-2">install</h2>
          <div className="flex items-center gap-2 rounded-lg border border-hairline bg-faint px-3 py-2.5">
            <code className="font-mono text-[13px] flex-1 overflow-x-auto whitespace-nowrap">
              <span className="text-npmred font-bold">$ </span>
              {site.installCmd}
            </code>
            <CopyButton text={site.installCmd} />
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-hairline bg-faint px-3 py-2.5">
            <code className="font-mono text-[13px] flex-1 overflow-x-auto whitespace-nowrap">
              <span className="text-npmred font-bold">$ </span>
              npx shwetank
            </code>
            <CopyButton text="npx shwetank" />
          </div>
        </div>
        <dl className="space-y-4">
          {rows.map(([k, v]) => (
            <div key={k} className="border-b border-hairline pb-3">
              <dt className="font-mono text-xs text-muted">{k}</dt>
              <dd className="mt-1 font-mono text-sm">{v}</dd>
            </div>
          ))}
        </dl>
        <div>
          <h2 className="font-mono text-xs text-muted mb-3">maintainers</h2>
          <div className="flex items-center gap-3">
            <span className="grid place-items-center size-9 rounded-full bg-npmred text-white font-mono font-bold">
              s
            </span>
            <div className="font-mono text-sm">
              <p className="font-semibold">{site.handle}</p>
              <p className="text-xs text-muted">sole maintainer, ships often</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between font-mono text-xs text-muted">
        <p>
          © 2026 {site.name} · built with next.js + tailwind · no dark
          gradients were harmed
        </p>
        <p>
          also works:{" "}
          <span className="text-ink">curl shwetank.is-a.dev</span> ·{" "}
          <span className="text-ink">git clone https://shwetank.is-a.dev</span> ·{" "}
          <span className="text-ink">npx shwetank</span>
        </p>
      </div>
    </footer>
  );
}
