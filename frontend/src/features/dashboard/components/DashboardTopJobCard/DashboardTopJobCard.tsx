"use client";

import { memo } from "react";

import { JobCard } from "@/features/jobs/components/JobCard";
import { MatchReasonsList } from "@/features/recommendations/components/MatchReasonsList";
import type { Job } from "@/types";

export type DashboardTopJobCardProps = {
  job: Job;
};

export const DashboardTopJobCard = memo(({ job }: DashboardTopJobCardProps) => (
  <div className="min-w-0 space-y-3">
    <JobCard job={job} variant="compact" />
    <MatchReasonsList matchScore={job.matchScore} />
  </div>
));

DashboardTopJobCard.displayName = "DashboardTopJobCard";
