import type { ReactNode } from "react";

import { PageHeader } from "@/components/layout/PageHeader";

import { ResumeTabsNav } from "../ResumeTabsNav/ResumeTabsNav";

export type ResumeSectionLayoutProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export const ResumeSectionLayout = ({
  title = "Currículo Inteligente",
  description = "Otimize seu currículo para as vagas que você acompanha.",
  children,
}: ResumeSectionLayoutProps) => (
  <div className="space-y-6">
    <PageHeader title={title} description={description} />
    <ResumeTabsNav />
    {children}
  </div>
);
