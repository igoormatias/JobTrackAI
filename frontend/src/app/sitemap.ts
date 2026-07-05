import type { MetadataRoute } from "next";

import { metadataBase } from "@/lib/seo/site-config";

const publicPaths = ["/", "/login", "/terms", "/privacy"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map((path) => ({
    url: new URL(path === "/" ? "" : path, metadataBase).toString(),
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path === "/login" ? 0.8 : 0.5,
  }));
}
