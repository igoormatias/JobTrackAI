import { Briefcase } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export const JobsPlaceholderPage = () => (
  <div className="space-y-6">
    <PageHeader title="Vagas" description="Explore oportunidades compatíveis com seu perfil." />
    <EmptyState
      icon={Briefcase}
      title="Em breve"
      description="A listagem de vagas será implementada na próxima etapa."
    />
  </div>
);
