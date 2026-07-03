"use client";

import Link from "next/link";
import { memo } from "react";

import { Button } from "@/components/ui/Button";
import { JobCard } from "@/features/jobs/components/JobCard";
import type { Job } from "@/types";

export type DashboardTopJobCardProps = {
  job: Job;
};

export const DashboardTopJobCard = memo(({ job }: DashboardTopJobCardProps) => (
  <div className="min-w-0 space-y-3">
    <JobCard job={job} variant="compact" />
    <div className="flex justify-end">
      <Link href={`/jobs/${job.id}`}>
        <Button size="sm" variant="outline">
          Ver vaga
        </Button>
      </Link>
    </div>
  </div>
));

DashboardTopJobCard.displayName = "DashboardTopJobCard";
