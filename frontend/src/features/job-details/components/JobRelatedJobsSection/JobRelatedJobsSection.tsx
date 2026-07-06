"use client";

import { openJobUrl } from "@/lib/jobs/open-job-url";
import type { Job } from "@/types";

import { RelatedJobCard } from "../RelatedJobCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

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
      <CardContent className="grid gap-3 lg:grid-cols-1">
        {jobs.map((job) => (
          <RelatedJobCard
            key={job.id}
            job={job}
            onOpenOriginal={(item) => openJobUrl({ sourceUrl: item.sourceUrl, status: item.status })}
          />
        ))}
      </CardContent>
    </Card>
  );
};
