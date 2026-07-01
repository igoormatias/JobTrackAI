import type { Application, PipelineListParams, PipelineStage, TimelineEvent } from "@/types";

export type MoveApplicationPayload = {
  stage: PipelineStage;
};

export type PipelineDetailDto = {
  application: Application;
  timeline: TimelineEvent[];
};

export type { PipelineListParams };
