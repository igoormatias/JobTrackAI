const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteConfig = {
  name: "JobTrack AI",
  shortName: "JobTrack",
  description:
    "Career Tracker inteligente para descobrir vagas, organizar candidaturas e acompanhar processos seletivos.",
  tagline: "Sua busca por emprego, inteligente e organizada.",
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
    "JobTrack AI",
  ],
  ogImage: "/brand/og-image.svg",
  logo: "/brand/logo.svg",
  logoMark: "/brand/logo-mark.svg",
  icon: "/brand/icon.svg",
  twitterHandle: "@jobtrackai",
} as const;

export const metadataBase = new URL(siteConfig.url);
