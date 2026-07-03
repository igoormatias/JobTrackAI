import type { Metadata } from "next";

import { DashboardPage } from "@/features/dashboard";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Dashboard",
  description: "Visão geral da sua jornada de busca por emprego no JobTrack AI.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardRoutePage() {
  return <DashboardPage />;
}
