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

const salaryExpectationSchema = z
  .object({
    min: z.number().int().nonnegative(),
    max: z.number().int().nonnegative(),
    currency: z.literal("BRL"),
  })
  .nullable()
  .optional();

export const updateProcessSchema = z.object({
  notes: z.string().nullable().optional(),
  feedback: z.string().nullable().optional(),
  priority: z.enum(JOB_PRIORITIES).optional(),
  isFavorite: z.boolean().optional(),
  recruiterName: z.string().nullable().optional(),
  recruiterEmail: z.union([z.string().email(), z.literal(""), z.null()]).optional(),
  recruiterPhone: z.string().nullable().optional(),
  recruiterLinkedin: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  tags: z.array(z.string()).optional(),
  negotiatedSalary: z.number().int().nullable().optional(),
  offerValue: z.number().int().nullable().optional(),
  salaryExpectation: salaryExpectationSchema,
  processLinks: z.record(z.string()).nullable().optional(),
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
  timezone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  meetingType: z.enum(["meet", "teams", "zoom", "other"]).optional().nullable(),
  link: z.string().url().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
});

export const updateInterviewSchema = z.object({
  scheduledAt: z.string().datetime().optional(),
  timezone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  meetingType: z.enum(["meet", "teams", "zoom", "other"]).optional().nullable(),
  link: z.string().url().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
});
