import { z } from "zod";

import type { NormalizedJob } from "../entities/normalized-job.entity.js";

const normalizedJobSchema = z.object({
  title: z.string().min(1),
  company: z.string().min(1),
  description: z.string().optional().default(""),
  technologies: z.array(z.string()).default([]),
  seniority: z.string().nullable().optional(),
  modality: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  sourceUrl: z.string().url(),
  provider: z.string().min(1),
  publishedAt: z.date(),
  contentHash: z.string().min(1),
  externalId: z.string().min(1),
});

export type JobValidationResult =
  | { valid: true; job: NormalizedJob }
  | { valid: false; error: string };

export class JobValidator {
  validate(job: NormalizedJob): JobValidationResult {
    const parsed = normalizedJobSchema.safeParse(job);
    if (!parsed.success) {
      return { valid: false, error: parsed.error.issues.map((i) => i.message).join("; ") };
    }
    return { valid: true, job: parsed.data as NormalizedJob };
  }
}

export const jobValidator = new JobValidator();
