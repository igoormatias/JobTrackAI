import { z } from "zod";

import { JOB_PRIORITIES } from "../../../shared/domain/job-priority.js";
import { JOB_VISIBILITIES } from "../../../shared/domain/job-visibility.js";

export const jobListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(["match", "date", "salary", "title", "company", "priority"]).optional(),
  sortDirection: z.enum(["asc", "desc"]).optional(),
  q: z.string().optional(),
  search: z.string().optional(),
  areas: z.union([z.string(), z.array(z.string())]).optional(),
  companyIds: z.union([z.string(), z.array(z.string())]).optional(),
  seniorities: z.union([z.string(), z.array(z.string())]).optional(),
  modalities: z.union([z.string(), z.array(z.string())]).optional(),
  location: z.string().optional(),
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),
  skills: z.union([z.string(), z.array(z.string())]).optional(),
  matchMin: z.coerce.number().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  isFavorite: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional()
    .transform((value) => {
      if (value === "true" || value === true) return true;
      if (value === "false" || value === false) return false;
      return undefined;
    }),
  visibility: z.enum(["visible", "hidden", "all"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  sources: z.union([z.string(), z.array(z.string())]).optional(),
});

export const favoriteJobSchema = z.object({
  isFavorite: z.boolean().optional(),
});

export const updateJobPrioritySchema = z.object({
  priority: z.enum(JOB_PRIORITIES),
});

export const updateJobVisibilitySchema = z.object({
  visibility: z.enum(JOB_VISIBILITIES),
});

export const createManualJobSchema = z.object({
  company: z.string().min(1),
  title: z.string().min(1),
  sourceUrl: z.string().url(),
  description: z.string().min(1),
  appliedAt: z.string().datetime().optional(),
  initialStage: z.string().optional(),
  notes: z.string().optional(),
  source: z.literal("manual").default("manual"),
});

export type JobListQuery = z.infer<typeof jobListQuerySchema>;
export type UpdateJobPriorityInput = z.infer<typeof updateJobPrioritySchema>;
export type UpdateJobVisibilityInput = z.infer<typeof updateJobVisibilitySchema>;
export type CreateManualJobInput = z.infer<typeof createManualJobSchema>;
