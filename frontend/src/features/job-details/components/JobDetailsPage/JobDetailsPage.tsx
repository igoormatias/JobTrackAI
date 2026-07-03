"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { AddToTrackingModal } from "@/features/tracking/components/AddToTrackingModal/AddToTrackingModal";
import { useCreateTrackingMutation } from "@/features/tracking/hooks/use-tracking-mutations/use-tracking-mutations";
import { listCompanies } from "@/services/companies-service";
import { queryKeys } from "@/lib/query-client/query-keys";
import type { JobDetailsCompany } from "../../types/job-details.types";

import { JobDetailsBottomActions } from "../../components/JobDetailsBottomActions";
import { JobDetailsBreadcrumb } from "../../components/JobDetailsBreadcrumb";
import { JobDetailsHeader } from "../../components/JobDetailsHeader";
import { JobDetailsPageSkeleton } from "../../components/JobDetailsPageSkeleton";
import { JOB_DETAILS_LAYOUT } from "../../constants/job-details-constants";
import { useJobDetailsMutations } from "../../hooks/use-job-details-mutations";
import { useJobDetailsQuery } from "../../hooks/use-job-details-query";
import { useJobInsightsQuery } from "../../hooks/use-job-insights-query";
import { useJobMatchQuery } from "../../hooks/use-job-match-query";
import { useJobTimelineQuery } from "../../hooks/use-job-timeline-query";
import { useLearningGapsQuery } from "../../hooks/use-learning-gaps-query";
import { useMarkJobViewedOnMount } from "../../hooks/use-mark-job-viewed-on-mount";
import { useRelatedJobsQuery } from "../../hooks/use-related-jobs-query";
import { shareJobUrl } from "../../utils/share-job";
import { JobDetailsMainWidget } from "../../widgets/JobDetailsMainWidget";
import {
  JobDetailsMobileExtrasWidget,
  JobDetailsSidebarWidget,
} from "../../widgets/JobDetailsSidebarWidget";

export const JobDetailsPage = () => {
  const params = useParams<{ id: string }>();
  const jobId = params.id;

  const { data: job, isLoading, isError } = useJobDetailsQuery(jobId);
  const jobReady = Boolean(job);

  const { data: match } = useJobMatchQuery(jobId, jobReady);
  const { data: relatedJobs = [] } = useRelatedJobsQuery(jobId, jobReady);
  const { data: timeline = [] } = useJobTimelineQuery(jobId, jobReady);
  const { data: insights = [] } = useJobInsightsQuery(jobId, jobReady);
  const { data: gaps = [] } = useLearningGapsQuery(jobId, jobReady);

  const { data: companiesData } = useQuery({
    queryKey: queryKeys.companies.list({ limit: 50 }),
    queryFn: () => listCompanies({ limit: 50 }),
    enabled: jobReady,
  });

  const { favoriteMutation } = useJobDetailsMutations();
  const createTrackingMutation = useCreateTrackingMutation();
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  useMarkJobViewedOnMount(job);

  const companyRecord = companiesData?.data.find((item) => item.id === job?.companyId);
  const company: JobDetailsCompany | null = companyRecord
    ? {
        id: companyRecord.id,
        name: companyRecord.name,
        slug: companyRecord.slug,
        logoUrl: companyRecord.logoUrl,
        website: companyRecord.website,
        industry: companyRecord.industry,
        jobCount: companyRecord.jobCount,
      }
    : job
      ? {
          id: job.company.id,
          name: job.company.name,
          slug: job.company.slug,
          logoUrl: job.company.logoUrl,
          website: null,
          industry: "Tecnologia",
          jobCount: 0,
        }
      : null;

  const handleShare = useCallback(async () => {
    if (!job) return;
    try {
      const result = await shareJobUrl(window.location.href, `${job.title} · ${job.company.name}`);
      toast.success(result === "shared" ? "Vaga compartilhada" : "Link copiado");
    } catch {
      toast.error("Não foi possível compartilhar a vaga");
    }
  }, [job]);

  const handleFavorite = useCallback(() => {
    if (!job) return;
    favoriteMutation.mutate({ id: job.id, isFavorite: !job.isFavorite });
  }, [favoriteMutation, job]);

  const handleOpenJob = useCallback(() => {
    if (!job?.sourceUrl) return;
    window.open(job.sourceUrl, "_blank", "noopener,noreferrer");
  }, [job]);

  const handleAddToPipeline = useCallback(() => {
    if (!job) return;
    setTrackingModalOpen(true);
  }, [job]);

  if (isLoading) return <JobDetailsPageSkeleton />;

  if (isError || !job) {
    return (
      <EmptyState
        title="Vaga não encontrada"
        description="Não foi possível carregar os detalhes desta vaga."
        action={
          <Link href="/jobs">
            <Button variant="outline">Voltar para vagas</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className={JOB_DETAILS_LAYOUT.page}>
      <JobDetailsHeader onShare={handleShare} />
      <JobDetailsBreadcrumb jobTitle={job.title} />

      <div className={JOB_DETAILS_LAYOUT.grid}>
        <JobDetailsMainWidget job={job} match={match} gaps={gaps} />
        <JobDetailsSidebarWidget
          match={match}
          insights={insights}
          company={company}
          relatedJobs={relatedJobs}
          timeline={timeline}
          trackingId={job.trackingId}
          onAddToPipeline={handleAddToPipeline}
        />
      </div>

      <JobDetailsMobileExtrasWidget
        insights={insights}
        company={company}
        relatedJobs={relatedJobs}
        timeline={timeline}
      />

      <JobDetailsBottomActions
        job={job}
        onFavorite={handleFavorite}
        onOpenJob={handleOpenJob}
        onAddToPipeline={handleAddToPipeline}
        isFavoritePending={favoriteMutation.isPending}
        isAddToPipelinePending={createTrackingMutation.isPending}
      />

      <AddToTrackingModal
        open={trackingModalOpen}
        onOpenChange={setTrackingModalOpen}
        mode="fromJob"
        job={job}
        isSubmitting={createTrackingMutation.isPending}
        onSubmit={(values) => {
          createTrackingMutation.mutate(
            values as Parameters<typeof createTrackingMutation.mutate>[0],
            { onSuccess: () => setTrackingModalOpen(false) },
          );
        }}
      />
    </div>
  );
};
