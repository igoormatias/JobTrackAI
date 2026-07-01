import type { Application, PipelineData, TimelineEvent } from "../types/pipeline.types.js";

export type PipelineResponseDto = {
  data: PipelineData;
};

export type ApplicationResponseDto = {
  data: Application;
  message?: string;
};

export type TimelineResponseDto = {
  data: TimelineEvent[];
};

export type DeleteResponseDto = {
  message: string;
};
