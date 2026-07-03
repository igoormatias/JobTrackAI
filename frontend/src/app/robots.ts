import type { MetadataRoute } from "next";

import { metadataBase } from "@/lib/seo/site-config";

const privatePaths = [
  "/dashboard",
  "/jobs",
  "/pipeline",
  "/profile",
  "/settings",
  "/onboarding",
  "/session-expired",
  "/unauthorized",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/login"],
      disallow: privatePaths,
    },
    sitemap: new URL("/sitemap.xml", metadataBase).toString(),
  };
}
