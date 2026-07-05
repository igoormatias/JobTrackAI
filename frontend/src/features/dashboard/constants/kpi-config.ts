import {
  Briefcase,
  Calendar,
  EyeOff,
  Heart,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

export type KpiConfig = {
  icon: LucideIcon;
  description: string;
};

export const KPI_CONFIG: Record<string, KpiConfig> = {
  kpi_new_jobs: {
    icon: Briefcase,
    description: "Vagas publicadas recentemente na sua área",
  },
  kpi_match_90: {
    icon: Target,
    description: "Oportunidades com excelente compatibilidade",
  },
  kpi_favorites: {
    icon: Heart,
    description: "Vagas que você salvou para acompanhar",
  },
  kpi_high_priority: {
    icon: Target,
    description: "Processos marcados como alta prioridade",
  },
  kpi_hidden: {
    icon: EyeOff,
    description: "Vagas ocultadas da listagem principal",
  },
  kpi_in_process: {
    icon: Briefcase,
    description: "Processos ativos fora de descoberta",
  },
  kpi_applications: {
    icon: Sparkles,
    description: "Candidaturas ativas no seu pipeline",
  },
  kpi_interviews: {
    icon: Calendar,
    description: "Entrevistas agendadas no calendário",
  },
};
