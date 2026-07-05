import type { Metadata } from "next";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Entrar",
  description: `${siteConfig.tagline} Faça login com Google para acessar pipeline, match inteligente, currículo e agenda de entrevistas.`,
  path: "/login",
});

export default function LoginRoutePage() {
  return <LoginPage />;
}
