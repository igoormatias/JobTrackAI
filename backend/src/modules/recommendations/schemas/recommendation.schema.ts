import { z } from "zod";

export const recommendationListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export type RecommendationListQuery = z.infer<typeof recommendationListQuerySchema>;
