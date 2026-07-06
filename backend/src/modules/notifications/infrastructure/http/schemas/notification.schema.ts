import { z } from "zod";

const notificationTypeSchema = z.enum([
  "new_job",
  "recommendation",
  "pipeline_change",
  "interview_reminder",
  "dashboard_update",
  "job_closed",
]);

const notificationCategorySchema = z.enum(["jobs", "pipeline", "calendar", "system"]);

export const notificationListQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  read: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true")),
  type: notificationTypeSchema.optional(),
  category: notificationCategorySchema.optional(),
  q: z.string().trim().min(1).max(200).optional(),
});

export const markNotificationsReadSchema = z
  .object({
    ids: z.array(z.string()).optional(),
    all: z.boolean().optional(),
  })
  .refine((data) => data.all === true || (data.ids?.length ?? 0) > 0, {
    message: "Provide ids or set all to true",
  });

export const deleteNotificationsSchema = z.object({
  ids: z.array(z.string()).min(1),
});
