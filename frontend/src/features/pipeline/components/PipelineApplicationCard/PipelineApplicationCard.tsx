"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Bookmark, Calendar, ExternalLink, Eye, Trash2 } from "lucide-react";
import { memo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { FAVORITE_JOB_BADGE_CLASS, FAVORITE_JOB_SURFACE_CLASS } from "@/features/jobs/constants/jobs-constants";
import { formatModality, getCompanyInitials } from "@/features/jobs/utils/job-formatters";
import { MatchScoreBadge } from "@/features/recommendations/components/MatchScoreBadge";
import { openJobUrl } from "@/lib/jobs/open-job-url";
import { cn } from "@/lib/utils";
import type { Application } from "@/types";

import { PIPELINE_STAGE_LABELS } from "../../constants/pipeline-columns";

export type PipelineApplicationCardProps = {
  application: Application;
  onOpenDetails: (application: Application) => void;
  onFavorite: (application: Application) => void;
  onDelete: (application: Application) => void;
  onScheduleInterview: (application: Application) => void;
  isDragging?: boolean;
  isPending?: boolean;
};

const PipelineApplicationCardComponent = ({
  application,
  onOpenDetails,
  onFavorite,
  onDelete,
  onScheduleInterview,
  isDragging,
  isPending,
}: PipelineApplicationCardProps) => {
  const { job } = application;
  const stageUpdatedAt = application.lastStageUpdatedAt ?? application.appliedAt;

  return (
    <Card
      className={cn(
        "cursor-grab border transition-shadow active:cursor-grabbing",
        job.isFavorite ? FAVORITE_JOB_SURFACE_CLASS : "border-border/60",
        isDragging && "opacity-60 shadow-lg",
        isPending && "opacity-70",
      )}
      aria-label={`${job.title} em ${job.company.name}`}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            {job.company.logoUrl ? <AvatarImage src={job.company.logoUrl} alt={job.company.name} /> : null}
            <AvatarFallback>{getCompanyInitials(job.company.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="truncate font-semibold text-foreground">{job.title}</p>
              {job.isFavorite ? <Badge className={FAVORITE_JOB_BADGE_CLASS}>Favorita</Badge> : null}
            </div>
            <p className="truncate text-sm text-muted-foreground">{job.company.name}</p>
          </div>
        </div>

        <MatchScoreBadge matchScore={job.matchScore} />

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{job.location}</span>
          <span>·</span>
          <span>{formatModality(job.modality)}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {job.technologies.slice(0, 3).map((tech) => (
            <Chip key={tech.id}>{tech.name}</Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{PIPELINE_STAGE_LABELS[application.stage]}</Badge>
          <span className="text-xs text-muted-foreground" data-testid="pipeline-stage-updated-at">
            {formatDistanceToNow(new Date(stageUpdatedAt), { addSuffix: true, locale: ptBR })}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => openJobUrl({ sourceUrl: job.sourceUrl, status: job.status })}
            aria-label="Ver vaga"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onOpenDetails(application)}
            aria-label="Abrir detalhes"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onFavorite(application)}
            aria-label={job.isFavorite ? "Desfavoritar" : "Favoritar"}
          >
            <Bookmark className={cn(job.isFavorite && "fill-current")} />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onScheduleInterview(application)}
            aria-label="Agendar entrevista"
          >
            <Calendar className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onDelete(application)}
            aria-label="Remover candidatura"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const PipelineApplicationCard = memo(PipelineApplicationCardComponent);
