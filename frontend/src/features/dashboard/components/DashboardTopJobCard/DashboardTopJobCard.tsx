"use client";

import Link from "next/link";
import { memo } from "react";

import { Button } from "@/components/ui/Button";
import { ACTION_LABELS } from "@/constants/action-labels";
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
    <div className="flex justify-end">
      <Link href={`/jobs/${job.id}`}>
        <Button size="sm" variant="outline">
          {ACTION_LABELS.viewJobDescription}
        </Button>
      </Link>
    </div>
  </div>
));

DashboardTopJobCard.displayName = "DashboardTopJobCard";
