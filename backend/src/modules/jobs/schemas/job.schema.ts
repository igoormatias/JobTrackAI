import { z } from "zod";

export const jobListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(["match", "date", "salary", "title", "company"]).optional(),
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
  sources: z.union([z.string(), z.array(z.string())]).optional(),
});

export const favoriteJobSchema = z.object({
  isFavorite: z.boolean().optional(),
});

export type JobListQuery = z.infer<typeof jobListQuerySchema>;
