"use client";

import { useQuery } from "@tanstack/react-query";
import { Link2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { ImportJobByUrlModal } from "@/features/job-import/components/ImportJobByUrlModal/ImportJobByUrlModal";
import { AddToTrackingModal } from "@/features/tracking/components/AddToTrackingModal/AddToTrackingModal";
import { useCreateTrackingMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";
import { listCompanies } from "@/services/companies-service";
import { openJobUrl } from "@/lib/jobs/open-job-url";
import { queryKeys } from "@/lib/query-client/query-keys";
import type { Job, JobSortField, SortDirection } from "@/types";

import { JobsPageSkeleton } from "../../components/JobsPageSkeleton";
import { JOBS_LAYOUT, SALARY_FILTER_MIN_COVERAGE } from "../../constants/jobs-constants";
import { useInfiniteJobs } from "../../hooks/use-infinite-jobs";
import { useJobFilters } from "../../hooks/use-job-filters";
import { useJobMutations } from "../../hooks/use-job-mutations";
import { hasProfileDefaultFilters, loadProfileDefaultFilters, shouldSkipProfileDefaults } from "../../utils/profile-default-filters";
import { JobsResultsWidget } from "../../widgets/JobsResultsWidget";
import { JobsToolbarWidget } from "../../widgets/JobsToolbarWidget";

const getEmptyVariant = (
  hasActiveFilters: boolean,
  total: number,
): "no-jobs" | "no-results" | "restrictive" => {
  if (total === 0 && !hasActiveFilters) return "no-jobs";
  if (hasActiveFilters) return "restrictive";
  return "no-results";
};

export const JobsPage = () => {
  const filters = useJobFilters();
  const { hasActiveFilters, setFilters, setSearchInputValue } = filters;
  const { favoriteMutation, viewMutation } = useJobMutations();
  const createTrackingMutation = useCreateTrackingMutation();
  const [trackingJob, setTrackingJob] = useState<Job | null>(null);
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const profileDefaultsApplied = useRef(false);

  useEffect(() => {
    if (profileDefaultsApplied.current || hasActiveFilters || shouldSkipProfileDefaults()) return;

    profileDefaultsApplied.current = true;

    void loadProfileDefaultFilters()
      .then((defaults) => {
        if (!hasProfileDefaultFilters(defaults)) return;
        if (defaults.search) {
          setSearchInputValue(defaults.search);
        }
        void setFilters(defaults);
      })
      .catch(() => {
        profileDefaultsApplied.current = false;
      });
  }, [hasActiveFilters, setFilters, setSearchInputValue]);

  const profileFiltersActive = filters.urlState.suggested === true;

  const handleClearSuggestedFilters = () => {
    profileDefaultsApplied.current = false;
    filters.clearFilters({ skipProfileDefaults: true });
  };

  const { data: companiesData } = useQuery({
    queryKey: queryKeys.companies.list({ limit: 30 }),
    queryFn: () => listCompanies({ limit: 30 }),
  });

  const companies = useMemo(
    () =>
      companiesData?.data.map((company) => ({
        id: company.id,
        slug: company.slug,
        name: company.name,
      })) ?? [],
    [companiesData],
  );

  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteJobs(filters.listParams);

  const jobs = useMemo(
    () => data?.pages.flatMap((page: { data: Job[] }) => page.data) ?? [],
    [data],
  );

  const total = data?.pages[0]?.meta.total ?? 0;
  const queryMs = data?.pages[0]?.meta.queryMs;
  const salaryCoverageRatio = data?.pages[0]?.meta.salaryCoverageRatio ?? 1;
  const showSalaryFilter = salaryCoverageRatio >= SALARY_FILTER_MIN_COVERAGE;
  const { setUrlState } = filters;
  const { salaryMin, salaryMax } = filters.urlState;

  useEffect(() => {
    if (showSalaryFilter) return;
    if (salaryMin != null || salaryMax != null) {
      void setUrlState({ salaryMin: null, salaryMax: null });
    }
  }, [showSalaryFilter, salaryMin, salaryMax, setUrlState]);

  const handleSortChange = (sort: JobSortField) => {
    void filters.setUrlState({ sort });
  };

  const handleDirectionChange = (dir: SortDirection) => {
    void filters.setUrlState({ dir });
  };

  const handleFavorite = (job: Job) => {
    favoriteMutation.mutate({ id: job.id, isFavorite: !job.isFavorite });
  };

  const handleOpenJob = (job: Job) => {
    openJobUrl({ sourceUrl: job.sourceUrl, status: job.status });
  };

  const handleAddToPipeline = (job: Job) => {
    setTrackingJob(job);
    setTrackingModalOpen(true);
  };

  const handleViewDetails = (job: Job) => {
    if (job.engagementState === "new") {
      viewMutation.mutate(job.id);
    }
  };

  if (isLoading && !data) {
    return <JobsPageSkeleton />;
  }

  return (
    <div className={`${JOBS_LAYOUT.page} w-full min-w-0`}>
      <PageHeader
        title="Explorar Vagas"
        description="Oportunidades personalizadas com base no seu perfil profissional."
        actions={
          <Button type="button" variant="outline" onClick={() => setImportModalOpen(true)}>
            <Link2 className="size-4" aria-hidden />
            Importar por URL
          </Button>
        }
      />
      {profileFiltersActive ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
          <span>✨ Filtros sugeridos pelo seu perfil</span>
          <Button type="button" variant="ghost" size="sm" onClick={handleClearSuggestedFilters}>
            Limpar sugestões
          </Button>
        </div>
      ) : filters.canApplyProfileDefaults ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
          <span>Filtros do perfil não estão ativos.</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void filters.applyProfileDefaults()}
          >
            Aplicar filtros sugeridos
          </Button>
        </div>
      ) : null}
      <JobsToolbarWidget
        filters={filters}
        companies={companies}
        showSalaryFilter={showSalaryFilter}
      />
      <JobsResultsWidget
        jobs={jobs}
        total={total}
        queryMs={queryMs}
        sort={filters.urlFilters.sort ?? "match"}
        direction={filters.urlFilters.dir ?? "desc"}
        isLoading={isLoading}
        isError={isError}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage ?? false}
        emptyVariant={getEmptyVariant(filters.hasActiveFilters, total)}
        onSortChange={handleSortChange}
        onDirectionChange={handleDirectionChange}
        onLoadMore={() => void fetchNextPage()}
        onFavorite={handleFavorite}
        onOpenJob={handleOpenJob}
        onAddToPipeline={handleAddToPipeline}
        onViewDetails={handleViewDetails}
        onClearFilters={() => filters.clearFilters({ skipProfileDefaults: true })}
        onClearSearch={() => {
          filters.setSearchInputValue("");
          void filters.setUrlState({ search: "" });
        }}
        onRetry={() => void refetch()}
        favoritePendingId={
          favoriteMutation.isPending ? favoriteMutation.variables?.id : undefined
        }
      />

      <AddToTrackingModal
        open={trackingModalOpen}
        onOpenChange={setTrackingModalOpen}
        mode="fromJob"
        job={trackingJob}
        isSubmitting={createTrackingMutation.isPending}
        onSubmit={(values) => {
          createTrackingMutation.mutate(
            values as Parameters<typeof createTrackingMutation.mutate>[0],
            { onSuccess: () => setTrackingModalOpen(false) },
          );
        }}
      />

      <ImportJobByUrlModal
        open={importModalOpen}
        onOpenChange={setImportModalOpen}
        defaultAddToPipeline
      />
    </div>
  );
};
