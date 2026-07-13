"use client";

import type { Job } from "@/types";
import type { JobDetailsCompany, JobInsight, JobMatchDto, JobTimelineStep } from "../../types/job-details.types";
import { CareerAnalysisCard } from "@/features/ai/components/CareerAnalysisCard";
import { JOB_DETAILS_LAYOUT } from "../../constants/job-details-constants";
import { JobCompanyCard } from "../../components/JobCompanyCard";
import { JobInsightsCard } from "../../components/JobInsightsCard";
import { JobMatchScoreCircle } from "../../components/JobMatchScoreCircle";
import { JobPipelineTimeline } from "../../components/JobPipelineTimeline";
import { JobRelatedJobsSection } from "../../components/JobRelatedJobsSection";

export type JobDetailsSidebarWidgetProps = {
  match?: JobMatchDto;
  insights: JobInsight[];
  company?: JobDetailsCompany | null;
  relatedJobs: Job[];
  timeline: JobTimelineStep[];
  trackingId?: string;
  onAddToPipeline?: () => void;
};

export const JobDetailsSidebarWidget = ({
  match,
  insights,
  company,
  relatedJobs,
  timeline,
  trackingId,
  onAddToPipeline,
}: JobDetailsSidebarWidgetProps) => (
  <aside className={JOB_DETAILS_LAYOUT.sidebar}>
    {match ? <JobMatchScoreCircle score={match.matchScore.score} label={match.compatibilityLabel} /> : null}
    <CareerAnalysisCard
      trackingId={trackingId}
      matchScore={match?.matchScore.score}
      onAddToPipeline={onAddToPipeline}
    />
    {insights.length > 0 ? <JobInsightsCard insights={insights} /> : null}
    {company ? <JobCompanyCard company={company} /> : null}
    <JobRelatedJobsSection jobs={relatedJobs} />
    <JobPipelineTimeline steps={timeline} />
  </aside>
);

export const JobDetailsMobileExtrasWidget = ({
  match,
  insights,
  company,
  relatedJobs,
  timeline,
  trackingId,
  onAddToPipeline,
}: JobDetailsSidebarWidgetProps) => (
  <div className={JOB_DETAILS_LAYOUT.mobileStack}>
    <CareerAnalysisCard
      trackingId={trackingId}
      matchScore={match?.matchScore.score}
      onAddToPipeline={onAddToPipeline}
    />
    {insights.length > 0 ? <JobInsightsCard insights={insights} /> : null}
    {company ? <JobCompanyCard company={company} /> : null}
    <JobRelatedJobsSection jobs={relatedJobs} />
    <JobPipelineTimeline steps={timeline} />
  </div>
);
