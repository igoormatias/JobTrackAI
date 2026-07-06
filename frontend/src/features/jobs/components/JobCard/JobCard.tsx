"use client";

import Link from "next/link";
import { memo } from "react";
import { Bookmark, ExternalLink } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { MatchReasonsList } from "@/features/recommendations/components/MatchReasonsList";
import { MatchScoreBadge } from "@/features/recommendations/components/MatchScoreBadge";
import { formatSalaryRange } from "@/features/dashboard/utils/format-salary-range";
import { cn } from "@/lib/utils";
import type { Job } from "@/types";

import { JOB_ENGAGEMENT_LABELS, FAVORITE_JOB_BADGE_CLASS, FAVORITE_JOB_SURFACE_CLASS } from "../../constants/jobs-constants";
import { formatPublishedAgo, getCompanyInitials, getJobSourceLabel } from "../../utils/job-formatters";

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

    return (
      <Card
        className={cn(
          "border",
          job.isFavorite ? FAVORITE_JOB_SURFACE_CLASS : engagementBorderClass[job.engagementState],
          className,
        )}
      >
        <CardContent className={cn("flex flex-col gap-4", isCompact ? "p-4" : "p-5")}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-start gap-3">
              <Avatar className="h-10 w-10 shrink-0">
                {job.company.logoUrl ? (
                  <AvatarImage src={job.company.logoUrl} alt={job.company.name} />
                ) : null}
                <AvatarFallback>{getCompanyInitials(job.company.name)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate font-semibold text-foreground">{job.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {JOB_ENGAGEMENT_LABELS[job.engagementState]}
                  </Badge>
                  {job.isFavorite ? (
                    <Badge className={FAVORITE_JOB_BADGE_CLASS}>Favorita</Badge>
                  ) : null}
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {job.company.name} · {job.modality} · {job.location}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)} · {getJobSourceLabel(job.source)} ·{" "}
                  Publicado {formatPublishedAgo(job.publishedAt)}
                </p>
              </div>
            </div>
            <MatchScoreBadge matchScore={job.matchScore} className="shrink-0" />
          </div>

          {!isCompact ? (
            <>
              <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>
              <div className="flex flex-wrap gap-2">
                {job.technologies.slice(0, 5).map((tech) => (
                  <Chip key={tech.id}>{tech.name}</Chip>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {job.requirements.slice(0, 3).map((requirement) => (
                  <Chip key={requirement}>{requirement}</Chip>
                ))}
              </div>
              <MatchReasonsList matchScore={job.matchScore} />
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{job.modality}</Badge>
              <span className="text-xs text-muted-foreground">
                {formatSalaryRange(job.salaryMin, job.salaryMax, job.currency)}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <Button
              type="button"
              size="sm"
              variant={job.isFavorite ? "secondary" : "outline"}
              onClick={() => onFavorite?.(job)}
              disabled={isFavoritePending}
              aria-label={job.isFavorite ? "Desfavoritar vaga" : "Salvar vaga"}
              className="w-full sm:w-auto"
            >
              <Bookmark className={cn("mr-1 h-4 w-4", job.isFavorite && "fill-current")} />
              {job.isFavorite ? "Salvo" : "Salvar"}
            </Button>
            <Link href={`/jobs/${job.id}`} onClick={() => onViewDetails?.(job)} className="w-full sm:w-auto">
              <Button type="button" size="sm" variant="outline" className="w-full sm:w-auto">
                <ExternalLink className="mr-1 h-4 w-4" />
                Ver detalhes
              </Button>
            </Link>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOpenJob?.(job)}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="mr-1 h-4 w-4" />
              Abrir vaga
            </Button>
            <Button type="button" size="sm" onClick={() => onAddToPipeline?.(job)} className="w-full sm:w-auto">
              Iniciar processo
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  },
);

JobCard.displayName = "JobCard";
