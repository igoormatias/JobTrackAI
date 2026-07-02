import { z } from "zod";

const refreshFrequencySchema = z.enum(["15m", "30m", "1h", "2h", "manual"]);

export const accountSettingsSchema = z.object({
  theme: z.enum(["dark", "light", "system"]),
  jobRefreshFrequency: refreshFrequencySchema,
  dashboardNotificationInterval: refreshFrequencySchema,
});

export type AccountSettingsFormValues = z.infer<typeof accountSettingsSchema>;
