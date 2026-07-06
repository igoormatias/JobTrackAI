"use client";

import { AlertCircle, FilterX, SearchX, Briefcase } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";

export type JobsEmptyStateVariant = "no-jobs" | "no-results" | "restrictive" | "error";

export type JobsEmptyStateProps = {
  variant: JobsEmptyStateVariant;
  onClearFilters?: () => void;
  onClearSearch?: () => void;
  onRetry?: () => void;
};

const config = {
  "no-jobs": {
    icon: Briefcase,
    title: "Nenhuma vaga disponível",
    description: "Volte em breve para novas oportunidades alinhadas ao seu perfil.",
  },
  "no-results": {
    icon: SearchX,
    title: "Nenhum resultado encontrado",
    description: "Tente ajustar os termos da busca ou remover alguns filtros.",
  },
  restrictive: {
    icon: FilterX,
    title: "Filtros muito restritivos",
    description: "Amplie a busca para descobrir mais vagas compatíveis com você.",
  },
  error: {
    icon: AlertCircle,
    title: "Erro ao carregar vagas",
    description: "Não foi possível carregar a listagem. Tente novamente em instantes.",
  },
} as const;

export const JobsEmptyState = ({ variant, onClearFilters, onClearSearch, onRetry }: JobsEmptyStateProps) => {
  const state = config[variant];

  return (
    <EmptyState
      icon={state.icon}
      title={state.title}
      description={state.description}
      action={
        variant === "error" ? (
          <Button type="button" variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {onClearSearch ? (
              <Button type="button" variant="outline" onClick={onClearSearch}>
                Limpar pesquisa
              </Button>
            ) : null}
            {onClearFilters ? (
              <Button type="button" onClick={onClearFilters}>
                Limpar filtros
              </Button>
            ) : null}
          </div>
        )
      }
    />
  );
};
