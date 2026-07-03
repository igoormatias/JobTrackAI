import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/seo/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: siteConfig.themeColor,
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [
      {
        src: siteConfig.icon,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: siteConfig.logoMark,
        sizes: "64x64",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
