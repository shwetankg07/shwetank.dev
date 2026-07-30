import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/lib/data";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shwetank.is-a.dev"),
  title: "shwetank · developer, builder · the registry",
  description:
    "Shwetank, developer and CTO in Bangalore. Ships real products: three npm packages, a reverse-engineered keyboard driver, and a WebGL map of every train in India. Arch, btw.",
  openGraph: {
    title: "shwetank · the registry",
    description: site.tagline,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf8" },
    { media: "(prefers-color-scheme: dark)", color: "#151514" },
  ],
};

// applies the stored theme before first paint so there's no flash
const themeScript = `try{var t=localStorage.getItem("reg-theme");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${archivo.variable} ${jbMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a
          href="#readme"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-npmred focus:text-white focus:px-3 focus:py-2 focus:font-mono focus:text-sm"
        >
          skip to content
        </a>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
