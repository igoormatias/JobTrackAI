import { z } from "zod";

export const skillsCatalogQuerySchema = z.object({
  q: z.string().optional().default(""),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});

export const normalizeSkillsSchema = z.object({
  skills: z.array(z.string().min(1)).min(1).max(100),
});
