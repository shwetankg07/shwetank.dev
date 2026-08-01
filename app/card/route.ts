import { site } from "@/lib/data";

// What terminals see instead of the website. Try: curl -L shwetank.is-a.dev
// (proxy.ts rewrites / here for curl/wget/httpie user agents)

export const dynamic = "force-static";

const R = "\x1b[31m"; // red
const B = "\x1b[1m"; // bold
const D = "\x1b[2m"; // dim
const G = "\x1b[32m"; // green
const X = "\x1b[0m"; // reset

const WIDTH = 46;

function row(text = "", visibleLen = text.length) {
  return `${R}│${X}  ${text}${" ".repeat(Math.max(0, WIDTH - 4 - visibleLen))}${R}│${X}`;
}

function buildCard() {
  const top = `${R}╭${"─".repeat(WIDTH - 2)}╮${X}`;
  const bottom = `${R}╰${"─".repeat(WIDTH - 2)}╯${X}`;
  const label = (k: string, v: string) => {
    const plain = `${k.padEnd(10)}${v}`;
    return row(`${D}${k.padEnd(10)}${X}${v}`, plain.length);
  };
  const nameLine = () => {
    const version = `v${site.version}`;
    const pad = WIDTH - 4 - site.name.length - version.length;
    const plainLen = site.name.length + pad + version.length;
    return row(`${B}${site.name}${X}${" ".repeat(pad)}${D}${version}${X}`, plainLen);
  };
  const statusText = `● ${site.status} · open to interesting work`;
  const lines = [
    top,
    row(),
    nameLine(),
    row("developer · student · builder"),
    row(`${site.location.toLowerCase()}`),
    row(),
    label("education", site.education.lineTerse),
    label("github", `github.com/${site.handle}`),
    label("linkedin", `linkedin.com/in/${site.handle}`),
    label("email", site.email),
    row(),
    row(`${G}${statusText}${X}`, statusText.length),
    row(),
    row(`${R}$${X} ${B}npx shwetank${X}${D}   · interactive card${X}`, "$ npx shwetank   · interactive card".length),
    row(`${R}$${X} git clone https://shwetank.is-a.dev`, "$ git clone https://shwetank.is-a.dev".length),
    row(),
    bottom,
    `  ${D}arch btw · ships real products, end to end${X}`,
    "",
  ];
  return lines.join("\n") + "\n";
}

export function GET() {
  return new Response(buildCard(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
