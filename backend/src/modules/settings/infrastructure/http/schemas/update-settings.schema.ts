import { z } from "zod";

const refreshFrequencySchema = z.enum(["15m", "30m", "1h", "2h", "manual"]);

export const updateSettingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]).optional(),
  jobRefreshFrequency: refreshFrequencySchema.optional(),
  dashboardNotificationInterval: refreshFrequencySchema.optional(),
});

export type UpdateSettingsSchemaInput = z.infer<typeof updateSettingsSchema>;
