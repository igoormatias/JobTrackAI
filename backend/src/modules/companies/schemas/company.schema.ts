import { z } from "zod";

export const companyListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  q: z.string().optional(),
});
