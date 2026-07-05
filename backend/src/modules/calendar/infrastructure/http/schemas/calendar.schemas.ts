import { z } from "zod";

export const googleCallbackSchema = z.object({
  code: z.string().min(1),
});

export const listCalendarEventsQuerySchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
});
