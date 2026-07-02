"use client";

import { Bookmark, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { Job } from "@/types";

import { JOB_DETAILS_LAYOUT } from "../../constants/job-details-constants";

export type JobDetailsBottomActionsProps = {
  job: Job;
  onFavorite: () => void;
  onOpenJob: () => void;
  onAddToPipeline: () => void;
  isFavoritePending?: boolean;
  isAddToPipelinePending?: boolean;
};

export const JobDetailsBottomActions = ({
  job,
  onFavorite,
  onOpenJob,
  onAddToPipeline,
  isFavoritePending,
  isAddToPipelinePending,
}: JobDetailsBottomActionsProps) => {
  return (
    <div className={JOB_DETAILS_LAYOUT.bottomBar}>
      <div className="mx-auto flex max-w-3xl items-center gap-2">
        <Button
          type="button"
          variant={job.isFavorite ? "secondary" : "outline"}
          onClick={onFavorite}
          disabled={isFavoritePending}
          aria-label={job.isFavorite ? "Desfavoritar vaga" : "Salvar vaga"}
        >
          <Bookmark className={job.isFavorite ? "fill-current" : ""} />
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onOpenJob}
          disabled={!job.sourceUrl}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Abrir vaga
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={onAddToPipeline}
          disabled={isAddToPipelinePending}
        >
          Adicionar ao Pipeline
        </Button>
      </div>
    </div>
  );
};
