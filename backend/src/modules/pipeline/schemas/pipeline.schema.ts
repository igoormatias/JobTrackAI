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

export const updateApplicationNotesSchema = z.object({
  notes: z.string().nullable(),
});

export const createPipelineApplicationSchema = z.object({
  jobId: z.string().min(1),
  stage: pipelineStageSchema.optional(),
  notes: z.string().optional(),
  appliedAt: z.string().datetime().optional(),
});

export const updateTimelineEventSchema = z.object({
  occurredAt: z.string().datetime(),
});

export type UpdateApplicationNotesInput = z.infer<typeof updateApplicationNotesSchema>;
export type CreatePipelineApplicationInput = z.infer<typeof createPipelineApplicationSchema>;
export type UpdateTimelineEventInput = z.infer<typeof updateTimelineEventSchema>;
