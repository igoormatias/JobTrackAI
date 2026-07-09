"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Bookmark,
  ExternalLink,
  Eye,
  GripVertical,
  MoreVertical,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { memo } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "@/components/ui/Dropdown";
import { ACTION_LABELS } from "@/constants/action-labels";
import { FAVORITE_JOB_BADGE_CLASS, FAVORITE_JOB_SURFACE_CLASS } from "@/features/jobs/constants/jobs-constants";
import { formatModality, formatSeniority } from "@/features/jobs/utils/job-formatters";
import { PIPELINE_STAGE_LABELS } from "@/features/pipeline/constants/pipeline-columns";
import { MatchScoreBadge } from "@/features/recommendations/components/MatchScoreBadge";
import { openJobUrl } from "@/lib/jobs/open-job-url";
import { cn } from "@/lib/utils";
import type { Application } from "@/types";

import type { PipelineDensity } from "../../hooks/use-pipeline-density";

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
  density?: PipelineDensity;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
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
  density = "default",
  dragHandleProps,
}: PipelineApplicationCardProps) => {
  const { job } = application;
  const stageUpdatedAt = application.lastStageUpdatedAt ?? application.appliedAt;
  const isCompact = density === "compact";
  const stageLabel = PIPELINE_STAGE_LABELS[application.stage] ?? application.stage;

  const handleOpenJob = (event: React.MouseEvent) => {
    event.stopPropagation();
    openJobUrl({ sourceUrl: job.sourceUrl, status: job.status });
  };

  const stopPropagation = (event: React.MouseEvent) => event.stopPropagation();

  const menuItems = (
    <>
      <DropdownItem onClick={() => onOpenDetails(application)}>{ACTION_LABELS.openProcess}</DropdownItem>
      {onEdit ? <DropdownItem onClick={() => onEdit(application)}>{ACTION_LABELS.editProcess}</DropdownItem> : null}
      <DropdownItem onClick={() => openJobUrl({ sourceUrl: job.sourceUrl, status: job.status })}>
        {ACTION_LABELS.openOriginalJob}
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

  const actionButtons = (
    <div
      className={cn(
        "flex shrink-0 items-center gap-0.5",
        isCompact ? "" : "opacity-0 transition-opacity group-hover:opacity-100",
      )}
      onClick={stopPropagation}
    >
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={() => onOpenDetails(application)}
        aria-label="Abrir processo"
      >
        <Eye className="h-3.5 w-3.5" />
      </Button>
      {onEdit ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => onEdit(application)}
          aria-label="Editar processo"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={handleOpenJob}
        aria-label="Abrir vaga original"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Button>
      {onChangeStage ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
          onClick={() => onChangeStage(application)}
          aria-label="Alterar status"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      ) : null}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="h-7 w-7 p-0"
        onClick={() => onFavorite(application)}
        aria-label={job.isFavorite ? "Desfavoritar" : "Favoritar"}
      >
        <Bookmark className={cn("h-3.5 w-3.5", job.isFavorite && "fill-current")} />
      </Button>
      {onDelete ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(application)}
          aria-label="Excluir processo"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );

  const metaBadges = (
    <div className="flex flex-wrap items-center gap-1.5">
      {job.seniority ? (
        <Badge variant="secondary" className="text-[10px] font-normal">
          {formatSeniority(job.seniority)}
        </Badge>
      ) : null}
      <Badge variant="outline" className="text-[10px] font-normal">
        {formatModality(job.modality)}
      </Badge>
      {job.location ? (
        <Badge variant="outline" className="max-w-full truncate text-[10px] font-normal" title={job.location}>
          {job.location}
        </Badge>
      ) : null}
    </div>
  );

  return (
    <Card
      data-kanban-card
      className={cn(
        "group border transition-shadow",
        job.isFavorite ? FAVORITE_JOB_SURFACE_CLASS : "border-border/60",
        isDragging && "opacity-50 shadow-lg",
        isPending && "opacity-70",
        isCompact ? "shadow-none" : "hover:shadow-sm",
      )}
      aria-label={`${job.title} em ${job.company.name}`}
      onClick={() => onOpenDetails(application)}
    >
      <CardContent className={cn(isCompact ? "space-y-2 p-2.5" : "space-y-2.5 p-3")}>
        {/* Header: drag handle + company + favorite + actions */}
        <div className="flex items-start gap-2">
          {enableDrag && dragHandleProps ? (
            <button
              type="button"
              data-kanban-drag-handle
              className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted active:cursor-grabbing"
              aria-label="Arrastar processo"
              onClick={stopPropagation}
              {...dragHandleProps}
            >
              <GripVertical className="h-4 w-4" />
            </button>
          ) : null}

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-xs font-medium text-muted-foreground">{job.company.name}</p>
              {job.isFavorite ? (
                <Badge className={cn(FAVORITE_JOB_BADGE_CLASS, "shrink-0 text-[10px]")}>Favorita</Badge>
              ) : null}
            </div>

            <h3
              className={cn(
                "font-semibold leading-snug text-foreground",
                isCompact ? "line-clamp-2 text-sm" : "line-clamp-2 text-sm",
              )}
            >
              {job.title}
            </h3>
          </div>

          <div className="shrink-0" onClick={stopPropagation}>
            {isCompact ? (
              <Dropdown>
                <DropdownTrigger asChild>
                  <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label="Ações do processo">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownContent align="end">{menuItems}</DropdownContent>
              </Dropdown>
            ) : (
              <div className="hidden lg:block">{actionButtons}</div>
            )}
          </div>
        </div>

        {/* Meta badges: seniority, modality, location */}
        {metaBadges}

        {/* Stage badge */}
        <Badge
          variant="outline"
          className="w-fit border-primary/40 text-[10px] font-medium text-primary"
          data-testid="pipeline-stage-badge"
        >
          {stageLabel}
        </Badge>

        {/* Footer: match + last update */}
        <div className="flex items-center justify-between gap-2 border-t border-border/40 pt-2">
          <MatchScoreBadge matchScore={job.matchScore} className={isCompact ? "origin-left scale-90" : undefined} />
          <span className="shrink-0 text-[11px] text-muted-foreground" data-testid="pipeline-stage-updated-at">
            {formatDistanceToNow(new Date(stageUpdatedAt), { addSuffix: true, locale: ptBR })}
          </span>
        </div>

        {/* Mobile actions */}
        <div className="flex items-center justify-end gap-2 lg:hidden" onClick={stopPropagation}>
          {!isCompact ? (
            <Dropdown>
              <DropdownTrigger asChild>
                <Button type="button" size="sm" variant="ghost" className="h-7 w-7 p-0" aria-label="Ações do processo">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownContent align="end">{menuItems}</DropdownContent>
            </Dropdown>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};

export const PipelineApplicationCard = memo(PipelineApplicationCardComponent);
