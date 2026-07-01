"use client";

import { Bookmark } from "lucide-react";

import { Button } from "@/components/ui/Button";
import type { Job } from "@/types";

import { JOB_DETAILS_LAYOUT } from "../../constants/job-details-constants";

export type JobDetailsBottomActionsProps = {
  job: Job;
  onFavorite: () => void;
  onApply: () => void;
  isFavoritePending?: boolean;
  isApplyPending?: boolean;
};

export const JobDetailsBottomActions = ({
  job,
  onFavorite,
  onApply,
  isFavoritePending,
  isApplyPending,
}: JobDetailsBottomActionsProps) => {
  const isApplied = job.engagementState === "applied";

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
          className="flex-1"
          onClick={onApply}
          disabled={isApplyPending || isApplied}
        >
          {isApplied ? "Candidatura enviada" : "Me candidatar agora"}
        </Button>
      </div>
    </div>
  );
};
