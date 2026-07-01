"use client";

import Link from "next/link";
import { memo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { MatchScoreBadge } from "@/features/recommendations/components/MatchScoreBadge";
import type { Job } from "@/types";

import { formatSalaryRange } from "../../utils/format-salary-range";

const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export type DashboardTopJobCardProps = {
  job: Job;
};

export const DashboardTopJobCard = memo(({ job }: DashboardTopJobCardProps) => (
  <Card className="border-border/60">
    <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Avatar className="h-10 w-10 shrink-0">
          {job.company.logoUrl ? (
            <AvatarImage src={job.company.logoUrl} alt={job.company.name} />
          ) : null}
          <AvatarFallback>{getInitials(job.company.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 space-y-1">
          <p className="truncate font-medium text-foreground">{job.title}</p>
          <p className="truncate text-sm text-muted-foreground">{job.company.name}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{job.modality}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
        <MatchScoreBadge matchScore={job.matchScore} />
        <Link href={`/jobs/${job.id}`}>
          <Button size="sm" variant="outline">
            Ver vaga
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
));

DashboardTopJobCard.displayName = "DashboardTopJobCard";
