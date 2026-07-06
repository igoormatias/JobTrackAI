"use client";

import Link from "next/link";
import { ExternalLink, Eye } from "lucide-react";

import { MatchBadge } from "@/components/badges/MatchBadge";
import { Button } from "@/components/ui/Button";
import { TooltipWrapper } from "@/components/ui/Tooltip";
import { ACTION_LABELS, openOriginalJobLabel } from "@/constants/action-labels";
import { ACTION_TOOLTIPS } from "@/constants/action-tooltips";
import type { Job } from "@/types";

export type RelatedJobCardProps = {
  job: Job;
  onOpenOriginal?: (job: Job) => void;
};

export const RelatedJobCard = ({ job, onOpenOriginal }: RelatedJobCardProps) => (
  <article className="flex min-w-0 flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="min-w-0 flex-1 space-y-1">
      <TooltipWrapper content={job.title}>
        <h3 className="line-clamp-2 break-words text-sm font-semibold text-foreground">{job.title}</h3>
      </TooltipWrapper>
      <p className="truncate text-xs text-muted-foreground">{job.company.name}</p>
      <MatchBadge score={job.matchScore.score} className="text-xs" />
    </div>
    <div className="flex shrink-0 flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" asChild>
        <Link href={`/jobs/${job.id}`} title={ACTION_TOOLTIPS.viewJobDescription}>
          <Eye className="size-3.5" aria-hidden />
          {ACTION_LABELS.viewJobDescription}
        </Link>
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => onOpenOriginal?.(job)}
        title={ACTION_TOOLTIPS.openOriginalJob}
      >
        <ExternalLink className="size-3.5" aria-hidden />
        {openOriginalJobLabel(job.source)}
      </Button>
    </div>
  </article>
);
