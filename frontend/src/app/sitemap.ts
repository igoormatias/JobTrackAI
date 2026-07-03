import type { MetadataRoute } from "next";

import { metadataBase } from "@/lib/seo/site-config";

const publicRoutes: MetadataRoute.Sitemap = [
  {
    url: new URL("/login", metadataBase).toString(),
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: metadataBase.toString(),
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...publicRoutes,
  ];
}
