"use client";

import Link from "next/link";
import { memo } from "react";
import { Bookmark, ExternalLink, Eye } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ACTION_LABELS, openOriginalJobLabel } from "@/constants/action-labels";
import { ACTION_TOOLTIPS } from "@/constants/action-tooltips";
import { JobAvailableSources } from "@/features/jobs/components/JobAvailableSources";
import { PIPELINE_STAGE_LABELS } from "@/features/pipeline/constants/pipeline-columns";
import { MatchReasonsList } from "@/features/recommendations/components/MatchReasonsList";
import { MatchScoreBadge } from "@/features/recommendations/components/MatchScoreBadge";
import { formatSalaryRange } from "@/features/dashboard/utils/format-salary-range";
import { useIsDesktop } from "@/hooks/use-breakpoint";
import { cn } from "@/lib/utils";
import type { Job, PipelineStage } from "@/types";

import { JOB_ENGAGEMENT_LABELS, FAVORITE_JOB_BADGE_CLASS, FAVORITE_JOB_SURFACE_CLASS } from "../../constants/jobs-constants";
import {
  formatModality,
  formatPublishedAgo,
  formatSeniority,
  getCompanyInitials,
  getJobSourceLabel,
} from "../../utils/job-formatters";

export type JobCardProps = {
  job: Job;
  variant?: "default" | "compact";
  onFavorite?: (job: Job) => void;
  onOpenJob?: (job: Job) => void;
  onAddToPipeline?: (job: Job) => void;
  onViewDetails?: (job: Job) => void;
  isFavoritePending?: boolean;
  className?: string;
};

const engagementBorderClass: Record<Job["engagementState"], string> = {
  new: "border-primary/30",
  viewed: "border-border/60",
  favorited: "border-amber-500/40",
  applied: "border-emerald-500/40",
  rejected: "border-destructive/40",
};

const getPipelineStageLabel = (stage: string | null | undefined): string => {
  if (!stage) return "Na Pipeline";
  return PIPELINE_STAGE_LABELS[stage as PipelineStage] ?? stage;
};

export const JobCard = memo(
  ({
    job,
    variant = "default",
    onFavorite,
    onOpenJob,
    onAddToPipeline,
    onViewDetails,
    isFavoritePending = false,
    className,
  }: JobCardProps) => {
    const isCompact = variant === "compact";
    const isTracked = Boolean(job.isTracked ?? job.trackingId);
    const pipelineHref = job.trackingId ? `/pipeline/${job.trackingId}` : "/pipeline";
    const isDesktop = useIsDesktop();

    const metaBadges = (
      <div className="flex flex-wrap items-center gap-1.5">
        {job.seniority ? (
          <Badge variant="secondary" className="text-xs">
            {formatSeniority(job.seniority)}
          </Badge>
        ) : null}
        <Badge variant="outline" className="text-xs">
          {formatModality(job.modality)}
        </Badge>
        {job.location ? (
          <Badge variant="outline" className="max-w-48 truncate text-xs" title={job.location}>
            {job.location}
          </Badge>
        ) : null}
        {isTracked ? (
          <Badge
            variant="outline"
            className="border-emerald-500/40 text-xs text-emerald-700 dark:text-emerald-300"
          >
            Na Pipeline · {getPipelineStageLabel(job.stage)}
          </Badge>
        ) : null}
      </div>
    );

    const actionButtons = (
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Button
          type="button"
          size="sm"
          variant={job.isFavorite ? "secondary" : "outline"}
          onClick={() => onFavorite?.(job)}
          disabled={isFavoritePending}
          aria-label={job.isFavorite ? "Desfavoritar vaga" : "Salvar vaga"}
          className="w-full sm:w-auto"
        >
          <Bookmark className={cn("mr-1 h-4 w-4 shrink-0", job.isFavorite && "fill-current")} />
          <span className="truncate">{job.isFavorite ? ACTION_LABELS.savedJob : ACTION_LABELS.saveJob}</span>
        </Button>
        <Link href={`/jobs/${job.id}`} onClick={() => onViewDetails?.(job)} className="w-full sm:w-auto">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full sm:w-auto"
            title={ACTION_TOOLTIPS.viewJobDescription}
          >
            <Eye className="mr-1 h-4 w-4 shrink-0" />
            <span className="truncate">{ACTION_LABELS.viewJobDescription}</span>
          </Button>
        </Link>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onOpenJob?.(job)}
          className="w-full sm:w-auto"
          title={ACTION_TOOLTIPS.openOriginalJob}
          disabled={!job.sourceUrl}
        >
          <ExternalLink className="mr-1 h-4 w-4 shrink-0" />
          <span className="truncate">
            {job.sourceUrl ? openOriginalJobLabel(job.source) : ACTION_LABELS.noOriginalJob}
          </span>
        </Button>
        {isTracked ? (
          <Link href={pipelineHref} className="w-full sm:w-auto">
            <Button type="button" size="sm" className="w-full sm:w-auto">
              <span className="truncate">{ACTION_LABELS.viewProcess}</span>
            </Button>
          </Link>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => onAddToPipeline?.(job)}
            className="w-full sm:w-auto"
            title={ACTION_TOOLTIPS.startProcess}
          >
            <span className="truncate">{ACTION_LABELS.startProcess}</span>
          </Button>
        )}
      </div>
    );

    return (
      <Card
        className={cn(
          "border",
          job.isFavorite ? FAVORITE_JOB_SURFACE_CLASS : engagementBorderClass[job.engagementState],
          className,
        )}
      >
        <CardContent className={cn("flex flex-col gap-4", isCompact ? "p-4" : "p-4 sm:p-5")}>
          {/* Header: company → title → match */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Avatar className="hidden h-10 w-10 shrink-0 sm:flex">
                {job.company.logoUrl ? (
                  <AvatarImage src={job.company.logoUrl} alt={job.company.name} />
                ) : null}
                <AvatarFallback>{getCompanyInitials(job.company.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">{job.company.name}</p>
                <div className="flex flex-wrap items-start gap-2">
                  <h3 className="line-clamp-2 min-w-0 flex-1 font-semibold leading-snug text-foreground">
                    {job.title}
                  </h3>
                  <div className="flex shrink-0 flex-wrap gap-1.5">
                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                      {JOB_ENGAGEMENT_LABELS[job.engagementState]}
                    </Badge>
                    {job.isFavorite ? (
                      <Badge className={cn(FAVORITE_JOB_BADGE_CLASS, "text-[10px] sm:text-xs")}>Favorita</Badge>
                    ) : null}
                  </div>
                </div>
                {metaBadges}
                <p className="truncate text-xs text-muted-foreground">
                  {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)} · {getJobSourceLabel(job.source)} ·{" "}
                  Publicado {formatPublishedAgo(job.publishedAt)}
                </p>
              </div>
            </div>
            <MatchScoreBadge matchScore={job.matchScore} className="shrink-0 self-start" />
          </div>

          {!isCompact ? (
            <>
              <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.technologies.slice(0, 5).map((tech) => (
                  <Chip key={tech.id}>{tech.name}</Chip>
                ))}
              </div>
              <div className="hidden flex-wrap gap-2 sm:flex">
                {job.requirements.slice(0, 3).map((requirement) => (
                  <Chip key={requirement}>{requirement}</Chip>
                ))}
              </div>
              <MatchReasonsList
                matchScore={job.matchScore}
                maxVisible={isDesktop ? 0 : 3}
                collapsible={!isDesktop}
              />
              <JobAvailableSources job={job} />
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {job.seniority ? (
                <Badge variant="secondary" className="text-xs">
                  {formatSeniority(job.seniority)}
                </Badge>
              ) : null}
              <Badge variant="outline">{formatModality(job.modality)}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
              </span>
            </div>
          )}

          {actionButtons}
        </CardContent>
      </Card>
    );
  },
);

JobCard.displayName = "JobCard";
