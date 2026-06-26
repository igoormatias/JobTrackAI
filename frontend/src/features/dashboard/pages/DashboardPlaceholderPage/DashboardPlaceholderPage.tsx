import { LayoutDashboard } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export const DashboardPlaceholderPage = () => (
  <div className="space-y-6">
    <PageHeader
      title="Dashboard"
      description="Visão geral da sua jornada de carreira."
    />
    <EmptyState
      icon={LayoutDashboard}
      title="Em breve"
      description="O dashboard será implementado na próxima etapa."
    />
  </div>
);
