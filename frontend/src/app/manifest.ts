import type { MetadataRoute } from "next";

import { siteConfig } from "@/lib/seo/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0b0b0c",
    theme_color: siteConfig.themeColor,
    lang: "pt-BR",
    orientation: "portrait-primary",
    icons: [
      {
        src: siteConfig.icon192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: siteConfig.icon512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
