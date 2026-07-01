import type { PipelineListParams, PipelineStage } from "@/types";

export type PipelineUrlFilters = PipelineListParams & {
  search?: string;
};

export type { PipelineStage };
