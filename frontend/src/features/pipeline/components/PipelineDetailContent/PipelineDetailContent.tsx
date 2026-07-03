"use client";

import type { Application } from "@/types";

import { Badge } from "@/components/ui/Badge";
import { CareerAnalysisCard } from "@/features/ai/components/CareerAnalysisCard";
import { MatchScoreBadge } from "@/features/recommendations/components/MatchScoreBadge";
import { formatModality } from "@/features/jobs/utils/job-formatters";

import { PIPELINE_STAGE_LABELS } from "../../constants/pipeline-columns";
import { useApplicationTimelineQuery } from "../../hooks/use-application-timeline-query";
import { PipelineApplicationTimeline } from "../PipelineApplicationTimeline";

export type PipelineDetailContentProps = {
  application: Application;
};

export const PipelineDetailContent = ({ application }: PipelineDetailContentProps) => {
  const { data: timeline = application.timeline } = useApplicationTimelineQuery(application.id);
  const { job } = application;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">{job.title}</h2>
        <p className="text-muted-foreground">{job.company.name}</p>
      </div>

      <MatchScoreBadge matchScore={job.matchScore} />

      <CareerAnalysisCard trackingId={application.id} matchScore={job.matchScore.score} />

      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
        <span>{job.location}</span>
        <span>·</span>
        <span>{formatModality(job.modality)}</span>
      </div>

      <Badge variant="outline">{PIPELINE_STAGE_LABELS[application.stage]}</Badge>

      {application.nextStep ? (
        <p className="text-sm text-foreground">
          <span className="font-medium">Próximo passo:</span> {application.nextStep}
        </p>
      ) : null}

      {application.notes ? (
        <p className="text-sm text-muted-foreground">{application.notes}</p>
      ) : null}

      <PipelineApplicationTimeline events={timeline} />
    </div>
  );
};
