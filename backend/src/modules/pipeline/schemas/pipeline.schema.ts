import { z } from "zod";

import { PIPELINE_STAGES, type PipelineStage } from "../constants/pipeline-stages.js";

const pipelineStageSchema = z.enum(PIPELINE_STAGES as unknown as [PipelineStage, ...PipelineStage[]]);

export const pipelineListQuerySchema = z.object({
  q: z.string().optional(),
  companyId: z.string().optional(),
  stage: pipelineStageSchema.optional(),
  area: z.string().optional(),
  technology: z.string().optional(),
  matchMin: z.coerce.number().optional(),
  isFavorite: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  sortBy: z.enum(["recent", "match", "company", "updated"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const moveApplicationSchema = z.object({
  stage: pipelineStageSchema,
});
