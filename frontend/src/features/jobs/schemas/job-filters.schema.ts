import { z } from "zod";

export const jobFiltersSchema = z.object({
  search: z.string().optional(),
  areas: z.array(z.string()).optional(),
  companyIds: z.array(z.string()).optional(),
  seniorities: z.array(z.string()).optional(),
  modalities: z.array(z.string()).optional(),
  location: z.string().optional(),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  skills: z.array(z.string()).optional(),
  matchMin: z.number().min(0).max(100).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  isFavorite: z.boolean().optional(),
  sources: z.array(z.string()).optional(),
});

export type JobFiltersFormValues = z.infer<typeof jobFiltersSchema>;
