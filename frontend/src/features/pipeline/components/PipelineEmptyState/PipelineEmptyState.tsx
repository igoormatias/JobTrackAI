import { Briefcase, Heart, PartyPopper, UserX, Video } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";

export type PipelineEmptyVariant = "all" | "favorites" | "interviews" | "offers";

const variants: Record<
  PipelineEmptyVariant,
  { title: string; description: string; icon: typeof Briefcase }
> = {
  all: {
    title: "Nenhuma candidatura ainda",
    description: "Favorite vagas ou candidate-se para acompanhar sua jornada aqui.",
    icon: Briefcase,
  },
  favorites: {
    title: "Sem favoritos no pipeline",
    description: "Salve vagas para organizá-las na coluna Favoritas.",
    icon: Heart,
  },
  interviews: {
    title: "Nenhuma entrevista agendada",
    description: "Avance candidaturas para acompanhar entrevistas neste pipeline.",
    icon: Video,
  },
  offers: {
    title: "Nenhuma oferta recebida",
    description: "Continue avançando nas etapas para receber propostas.",
    icon: PartyPopper,
  },
};

export type PipelineEmptyStateProps = {
  variant?: PipelineEmptyVariant;
};

export const PipelineEmptyState = ({ variant = "all" }: PipelineEmptyStateProps) => {
  const config = variants[variant];

  return (
    <EmptyState
      icon={variant === "all" ? config.icon : config.icon}
      title={config.title}
      description={config.description}
    />
  );
};

export const PipelineRejectedHint = () => (
  <EmptyState
    icon={UserX}
    title="Nenhuma rejeição recente"
    description="Ótimo sinal — seu pipeline está saudável."
  />
);
