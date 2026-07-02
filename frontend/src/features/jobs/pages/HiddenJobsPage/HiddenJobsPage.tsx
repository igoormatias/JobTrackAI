"use client";

import { AlertCircle, EyeOff } from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { JobCard } from "@/features/jobs/components/JobCard";
import { useInfiniteJobs } from "@/features/jobs/hooks/use-infinite-jobs";
import { useJobFilters } from "@/features/jobs/hooks/use-job-filters";
import { useTrackingVisibilityMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";

export const HiddenJobsPage = () => {
  const filters = useJobFilters();
  const { data, isLoading, isError, refetch } = useInfiniteJobs({
    ...filters.listParams,
    visibility: "hidden",
  });
  const restoreMutation = useTrackingVisibilityMutation();

  const jobs = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vagas ocultadas"
        description="Vagas que você ocultou da listagem principal. Restaure quando quiser voltar a vê-las."
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Não foi possível carregar vagas ocultas"
          description="Tente novamente em instantes."
          action={
            <Button type="button" variant="outline" onClick={() => void refetch()}>
              Tentar novamente
            </Button>
          }
        />
      ) : null}

      {!isLoading && !isError && jobs.length === 0 ? (
        <EmptyState
          icon={EyeOff}
          title="Nenhuma vaga oculta"
          description="Quando você ocultar vagas na listagem principal, elas aparecerão aqui."
        />
      ) : null}

      {!isLoading && !isError && jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="space-y-2">
              <JobCard job={job} variant="compact" />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={!job.trackingId || restoreMutation.isPending}
                onClick={() => {
                  if (!job.trackingId) return;
                  restoreMutation.mutate({ id: job.trackingId, visibility: "VISIBLE" });
                }}
              >
                Restaurar vaga
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
