"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { formatSalaryRange } from "@/features/dashboard/utils/format-salary-range";
import { formatPublishedAgo, getCompanyInitials, getJobSourceLabel } from "@/features/jobs/utils/job-formatters";
import type { Job } from "@/types";

import {
  EMPLOYMENT_TYPE_LABELS,
  MODALITY_LABELS,
  SENIORITY_LABELS,
} from "../../constants/job-details-constants";

export type JobDetailsHeroProps = {
  job: Job;
};

export const JobDetailsHero = ({ job }: JobDetailsHeroProps) => (
  <div className="space-y-4 rounded-lg border border-border/60 bg-card p-5">
    <div className="flex items-start gap-3">
      <Avatar className="h-12 w-12">
        {job.company.logoUrl ? <AvatarImage src={job.company.logoUrl} alt={job.company.name} /> : null}
        <AvatarFallback>{getCompanyInitials(job.company.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{job.title}</h1>
        <p className="text-muted-foreground">
          {job.company.name} · {MODALITY_LABELS[job.modality] ?? job.modality} · {job.location}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)} · {getJobSourceLabel(job.source)} ·
          Publicado {formatPublishedAgo(job.publishedAt)}
        </p>
      </div>
    </div>
    <div className="flex flex-wrap gap-2">
      <Badge variant="outline">{SENIORITY_LABELS[job.seniority] ?? job.seniority}</Badge>
      {job.employmentType ? (
        <Badge variant="outline">{EMPLOYMENT_TYPE_LABELS[job.employmentType]}</Badge>
      ) : null}
      <Badge variant="outline">{MODALITY_LABELS[job.modality] ?? job.modality}</Badge>
    </div>
  </div>
);
