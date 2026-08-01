import type { MetadataRoute } from "next";
import { site } from "@/lib/data";

// One page, one entry. lastModified tracks the CalVer version rather than the
// build clock, so redeploying without shipping anything doesn't fake freshness.
export default function sitemap(): MetadataRoute.Sitemap {
  const [y, m, d] = site.version.split(".").map(Number);

  return [
    {
      url: site.url,
      lastModified: new Date(Date.UTC(y, m - 1, d)),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
