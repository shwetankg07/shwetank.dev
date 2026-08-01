import { NextResponse, type NextRequest } from "next/server";

// Terminals asking for the homepage get the ANSI card instead of HTML.
// Browsers are unaffected. Try it: curl -L shwetank.is-a.dev
// (-L because Vercel 308s http->https at the edge, before this ever runs)

export function proxy(request: NextRequest) {
  const ua = request.headers.get("user-agent") ?? "";
  if (/\b(curl|wget|httpie|libwww|lynx|w3m|fetch)\b/i.test(ua)) {
    return NextResponse.rewrite(new URL("/card", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
