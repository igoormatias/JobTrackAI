import { Kanban } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export const PipelinePlaceholderPage = () => (
  <div className="space-y-6">
    <PageHeader title="Pipeline" description="Acompanhe suas candidaturas em andamento." />
    <EmptyState
      icon={Kanban}
      title="Em breve"
      description="O pipeline Kanban será implementado na próxima etapa."
    />
  </div>
);
