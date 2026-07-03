import type { Metadata } from "next";

import { ProfilePage } from "@/features/account";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Minha Conta",
  description: "Gerencie seu perfil e preferências no JobTrack AI.",
  path: "/profile",
  noIndex: true,
});

export default function Page() {
  return <ProfilePage />;
}
