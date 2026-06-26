import { User } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";

export const ProfilePlaceholderPage = () => (
  <div className="space-y-6">
    <PageHeader title="Meu Perfil" description="Gerencie suas informações profissionais." />
    <EmptyState
      icon={User}
      title="Em breve"
      description="O perfil será implementado na próxima etapa."
    />
  </div>
);
