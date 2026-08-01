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
  metadataBase: new URL(site.url),
  // Search results are the one place the legal name has to appear — the page
  // itself keeps calling him `shwetank`.
  title: `${site.fullName} — developer, builder · Bangalore`,
  description:
    "Shwetank Gupta — developer and CTO in Bangalore. Three npm packages, a reverse-engineered Linux keyboard driver, and a WebGL map of every train in India.",
  authors: [{ name: site.fullName, url: site.url }],
  creator: site.fullName,
  // Kills the shwetank.vercel.app duplicate: both origins serve this page, and
  // this tells Google which one is the real address.
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: `${site.fullName} · the registry`,
    description: site.tagline,
    url: "/",
    siteName: site.domain,
    locale: "en_IN",
    type: "profile",
  },
};

// Person schema. This is what a name search actually matches against — sameAs
// ties this page to the profiles Google already knows, so the three of them
// resolve to one entity instead of three unrelated Shwetanks.
const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.fullName,
  alternateName: site.name,
  url: site.url,
  image: `${site.url}/opengraph-image`,
  email: `mailto:${site.email}`,
  jobTitle: "CTO",
  description: site.tagline,
  worksFor: { "@type": "Organization", name: "chalyaaar runclub" },
  // affiliation, not alumniOf — he's a current student, not a graduate.
  affiliation: {
    "@type": "CollegeOrUniversity",
    name: site.education.school,
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bangalore",
    addressRegion: "Karnataka",
    addressCountry: "IN",
  },
  knowsAbout: [
    "Software Development",
    "Linux",
    "Arch Linux",
    "TypeScript",
    "Python",
    "Reverse Engineering",
    "Next.js",
    "WebGL",
  ],
  sameAs: [site.github, site.linkedin, site.npm],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
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
