import { z } from "zod";

import { JOB_SOURCES } from "../../../../../shared/domain/job-source.js";
import { JOB_PRIORITIES } from "../../../../../shared/domain/job-priority.js";
import { PIPELINE_STAGES } from "../../../../../shared/domain/pipeline-stage.js";

const manualJobSchema = z.object({
  companyName: z.string().min(1),
  title: z.string().min(1),
  sourceUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  source: z.enum(JOB_SOURCES),
  area: z.string().optional(),
  modality: z.string().optional(),
  location: z.string().optional(),
});

export const createTrackingSchema = z
  .object({
    jobId: z.string().optional(),
    job: manualJobSchema.optional(),
    stage: z.enum(PIPELINE_STAGES),
    stageOccurredAt: z.string().datetime(),
    notes: z.string().optional().nullable(),
  })
  .refine((data) => Boolean(data.jobId) !== Boolean(data.job), {
    message: "Provide either jobId or job payload",
  });

export const moveTrackingStageSchema = z.object({
  stage: z.enum(PIPELINE_STAGES),
  occurredAt: z.string().datetime(),
});

export const changePrioritySchema = z.object({
  priority: z.enum(JOB_PRIORITIES),
});

export const changeVisibilitySchema = z.object({
  visibility: z.enum(["VISIBLE", "HIDDEN"]),
});

export const updateNotesSchema = z.object({
  notes: z.string().nullable(),
});

export const updateTimelineEventSchema = z.object({
  occurredAt: z.string().datetime().optional(),
  notes: z.string().nullable().optional(),
});

export const trackingListQuerySchema = z.object({
  q: z.string().optional(),
  companyId: z.string().optional(),
  stage: z.enum(PIPELINE_STAGES).optional(),
  area: z.string().optional(),
  source: z.enum(JOB_SOURCES).optional(),
  isFavorite: z.coerce.boolean().optional(),
  priority: z.enum(JOB_PRIORITIES).optional(),
  visibility: z.enum(["VISIBLE", "HIDDEN", "all"]).optional(),
  sortBy: z.enum(["recent", "match", "company", "updated", "priority", "salary"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
});

export const createInterviewSchema = z.object({
  scheduledAt: z.string().datetime(),
  link: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const updateInterviewSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  link: z.string().url().optional().nullable(),
  notes: z.string().optional().nullable(),
});
