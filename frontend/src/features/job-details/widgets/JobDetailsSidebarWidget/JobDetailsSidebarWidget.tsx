"use client";

import type { Job } from "@/types";
import type { JobDetailsCompany, JobInsight, JobMatchDto, JobTimelineStep } from "../../types/job-details.types";
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
};

export const JobDetailsSidebarWidget = ({
  match,
  insights,
  company,
  relatedJobs,
  timeline,
}: JobDetailsSidebarWidgetProps) => (
  <aside className={JOB_DETAILS_LAYOUT.sidebar}>
    {match ? <JobMatchScoreCircle score={match.matchScore.score} label={match.compatibilityLabel} /> : null}
    {insights.length > 0 ? <JobInsightsCard insights={insights} /> : null}
    {company ? <JobCompanyCard company={company} /> : null}
    <JobRelatedJobsSection jobs={relatedJobs} />
    <JobPipelineTimeline steps={timeline} />
  </aside>
);

export const JobDetailsMobileExtrasWidget = ({
  insights,
  company,
  relatedJobs,
  timeline,
}: Omit<JobDetailsSidebarWidgetProps, "match">) => (
  <div className={JOB_DETAILS_LAYOUT.mobileStack}>
    {insights.length > 0 ? <JobInsightsCard insights={insights} /> : null}
    {company ? <JobCompanyCard company={company} /> : null}
    <JobRelatedJobsSection jobs={relatedJobs} />
    <JobPipelineTimeline steps={timeline} />
  </div>
);
