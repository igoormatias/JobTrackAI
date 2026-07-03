import type { Metadata } from "next";

import { LoginPage } from "@/features/auth/pages/LoginPage";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { createPageMetadata, siteConfig } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Entrar",
  description: `${siteConfig.tagline} Faça login com Google para acessar o JobTrack AI.`,
  path: "/login",
});

export default function LoginRoutePage() {
  return (
    <PublicLayout>
      <LoginPage />
    </PublicLayout>
  );
}
