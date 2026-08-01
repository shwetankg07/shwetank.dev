import type { MetadataRoute } from "next";
import { site } from "@/lib/data";

// The bare git objects under public/ are real repository internals — clonable,
// but meaningless as search results, and /card is a plain-text duplicate of the
// homepage. Keep both out of the index so the one page that matters ranks alone.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/card", "/HEAD", "/info/", "/objects/", "/refs/"],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
