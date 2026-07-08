"use client";

import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { ACTION_LABELS } from "@/constants/action-labels";
import type { Job } from "@/types";

import { JOB_DETAILS_LAYOUT } from "../../constants/job-details-constants";

export type JobDetailsBottomActionsProps = {
  job: Job;
  onFavorite: () => void;
  onAddToPipeline: () => void;
  isFavoritePending?: boolean;
  isAddToPipelinePending?: boolean;
};

export const JobDetailsBottomActions = ({
  job,
  onFavorite,
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
          aria-label={job.isFavorite ? "Desfavoritar vaga" : ACTION_LABELS.saveJob}
        >
          <Bookmark className={job.isFavorite ? "fill-current" : ""} />
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={onAddToPipeline}
          disabled={isAddToPipelinePending}
        >
          {ACTION_LABELS.startProcess}
        </Button>
      </div>
    </div>
  );
};
