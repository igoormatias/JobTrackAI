import { z } from "zod";

export const loginSchema = z.object({
  provider: z.literal("google"),
  idToken: z.string().min(1, "Google idToken is required"),
});

const professionalAreaSchema = z.enum([
  "frontend",
  "backend",
  "full_stack",
  "mobile",
  "qa",
  "devops",
  "ux_ui",
  "product_owner",
  "product_manager",
  "scrum_master",
  "tech_lead",
  "data_analyst",
  "data_engineer",
  "business_analyst",
  "agile_coach",
  "other",
]);

const senioritySchema = z.enum(["junior", "mid", "senior", "specialist", "lead"]);

const workModalitySchema = z.enum(["remote", "hybrid", "onsite", "any"]);

const salaryBandSchema = z.enum(["up_to_5k", "5k_8k", "8k_12k", "12k_15k", "15k_plus"]);

const salaryRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  currency: z.literal("BRL"),
});

const profileLocationSchema = z
  .object({
    scope: z.enum(["country", "state", "city"]),
    state: z.string().optional(),
    city: z.string().optional(),
    acceptsRelocation: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === "state" && !value.state?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Selecione um estado", path: ["state"] });
    }

    if (value.scope === "city" && !value.city?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Informe a cidade", path: ["city"] });
    }
  });

export const onboardingCompleteSchema = z.object({
  professionalArea: professionalAreaSchema,
  seniority: senioritySchema,
  modality: workModalitySchema,
  location: z.string().min(1),
  locationPreference: profileLocationSchema,
  salaryBand: salaryBandSchema,
  salaryExpectation: salaryRangeSchema,
  skills: z.array(z.string()).min(1).max(15),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>;
