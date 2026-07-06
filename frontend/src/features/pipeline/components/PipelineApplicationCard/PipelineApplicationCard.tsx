"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bookmark,
  ExternalLink,
  Eye,
  MoreVertical,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { memo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/Dropdown";
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
  onEdit?: (application: Application) => void;
  onFavorite: (application: Application) => void;
  onDelete?: (application: Application) => void;
  onChangeStage?: (application: Application) => void;
  isDragging?: boolean;
  isPending?: boolean;
  enableDrag?: boolean;
};

const PipelineApplicationCardComponent = ({
  application,
  onOpenDetails,
  onEdit,
  onFavorite,
  onDelete,
  onChangeStage,
  isDragging,
  isPending,
  enableDrag = true,
}: PipelineApplicationCardProps) => {
  const { job } = application;
  const stageUpdatedAt = application.lastStageUpdatedAt ?? application.appliedAt;

  const handleOpenJob = (event: React.MouseEvent) => {
    event.stopPropagation();
    openJobUrl({ sourceUrl: job.sourceUrl, status: job.status });
  };

  const stopPropagation = (event: React.MouseEvent) => event.stopPropagation();

  const menuItems = (
    <>
      <DropdownItem onClick={() => onOpenDetails(application)}>Abrir processo</DropdownItem>
      {onEdit ? <DropdownItem onClick={() => onEdit(application)}>Editar processo</DropdownItem> : null}
      <DropdownItem onClick={() => openJobUrl({ sourceUrl: job.sourceUrl, status: job.status })}>
        Abrir vaga
      </DropdownItem>
      {onChangeStage ? (
        <DropdownItem onClick={() => onChangeStage(application)}>Alterar status</DropdownItem>
      ) : null}
      <DropdownItem onClick={() => onFavorite(application)}>
        {job.isFavorite ? "Desfavoritar" : "Favoritar"}
      </DropdownItem>
      {onDelete ? (
        <DropdownItem className="text-destructive focus:text-destructive" onClick={() => onDelete(application)}>
          Excluir processo
        </DropdownItem>
      ) : null}
    </>
  );

  return (
    <Card
      className={cn(
        "border transition-shadow",
        enableDrag ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
        job.isFavorite ? FAVORITE_JOB_SURFACE_CLASS : "border-border/60",
        isDragging && "opacity-60 shadow-lg",
        isPending && "opacity-70",
      )}
      aria-label={`${job.title} em ${job.company.name}`}
      onClick={enableDrag ? undefined : () => onOpenDetails(application)}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            {job.company.logoUrl ? <AvatarImage src={job.company.logoUrl} alt={job.company.name} /> : null}
            <AvatarFallback>{getCompanyInitials(job.company.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="break-words font-semibold text-foreground">{job.title}</p>
              {job.isFavorite ? <Badge className={FAVORITE_JOB_BADGE_CLASS}>Favorita</Badge> : null}
            </div>
            <p className="truncate text-sm text-muted-foreground">{job.company.name}</p>
          </div>
          <div className="lg:hidden" onClick={stopPropagation}>
            <Dropdown>
              <DropdownTrigger asChild>
                <Button type="button" size="sm" variant="ghost" aria-label="Ações do processo">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownContent align="end">{menuItems}</DropdownContent>
            </Dropdown>
          </div>
        </div>

        <MatchScoreBadge matchScore={job.matchScore} />

        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="truncate">{job.location}</span>
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

        <div className="hidden flex-wrap gap-1 lg:flex" onClick={stopPropagation}>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onOpenDetails(application)}
            aria-label="Abrir processo"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {onEdit ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onEdit(application)}
              aria-label="Editar processo"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="outline" onClick={handleOpenJob} aria-label="Abrir vaga">
            <ExternalLink className="h-4 w-4" />
          </Button>
          {onChangeStage ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onChangeStage(application)}
              aria-label="Alterar status"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          ) : null}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onFavorite(application)}
            aria-label={job.isFavorite ? "Desfavoritar" : "Favoritar"}
          >
            <Bookmark className={cn("h-4 w-4", job.isFavorite && "fill-current")} />
          </Button>
          {onDelete ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onDelete(application)}
              aria-label="Excluir processo"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export const PipelineApplicationCard = memo(PipelineApplicationCardComponent);
