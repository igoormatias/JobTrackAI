"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { JobCard } from "@/features/jobs/components/JobCard";
import { useInfiniteJobs } from "@/features/jobs/hooks/use-infinite-jobs";
import { useJobFilters } from "@/features/jobs/hooks/use-job-filters";
import { useTrackingVisibilityMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";

export const HiddenJobsPage = () => {
  const filters = useJobFilters();
  const { data, isLoading } = useInfiniteJobs({ ...filters.listParams, visibility: "hidden" });
  const restoreMutation = useTrackingVisibilityMutation();

  const jobs = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vagas ocultadas"
        description="Vagas que você ocultou da listagem principal. Restaure quando quiser voltar a vê-las."
      />

      {isLoading ? <p className="text-sm text-muted-foreground">Carregando...</p> : null}

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
    </div>
  );
};
