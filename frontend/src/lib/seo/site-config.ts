const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "JobTrack AI",
  shortName: "JobTrack",
  description:
    "Plataforma de gerenciamento de carreira com Inteligência Artificial. Organize vagas, pipeline, entrevistas e evolua profissionalmente.",
  tagline: "Organize sua carreira com Inteligência Artificial.",
  version: "1.5.0",
  contactEmail: "contato@jobtrack.ai",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL,
  themeColor: "#6366f1",
  locale: "pt_BR",
  keywords: [
    "vagas de emprego",
    "busca de emprego",
    "career tracker",
    "pipeline de candidaturas",
    "organização de vagas",
    "processos seletivos",
    "inteligência artificial",
    "gerenciamento de carreira",
    "JobTrack AI",
  ],
  ogImage: "/brand/og-image.png",
  logo: "/brand/logo.svg",
  logoMark: "/brand/logo-mark.svg",
  logoLight: "/brand/logo-light.svg",
  logoMono: "/brand/logo-mono.svg",
  icon: "/brand/icon-192.png",
  icon192: "/brand/icon-192.png",
  icon512: "/brand/icon-512.png",
  appleTouchIcon: "/brand/apple-touch-icon.png",
  twitterHandle: "@jobtrackai",
} as const;

export const metadataBase = new URL(siteConfig.url);
