import { z } from "zod";

const notificationTypeSchema = z.enum([
  "new_job",
  "recommendation",
  "pipeline_change",
  "interview_reminder",
  "dashboard_update",
]);

export const notificationListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  read: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  type: notificationTypeSchema.optional(),
});

export const markNotificationsReadSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});
