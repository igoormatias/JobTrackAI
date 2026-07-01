"use client";

import { JobCard } from "@/features/jobs/components/JobCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Job } from "@/types";

export type JobRelatedJobsSectionProps = {
  jobs: Job[];
};

export const JobRelatedJobsSection = ({ jobs }: JobRelatedJobsSectionProps) => {
  if (jobs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Vagas relacionadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} variant="compact" />
        ))}
      </CardContent>
    </Card>
  );
};
