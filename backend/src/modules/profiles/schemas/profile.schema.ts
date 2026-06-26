import { z } from "zod";

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

const senioritySchema = z.enum(["intern", "junior", "mid", "senior", "specialist", "lead", "staff"]);

const workModalitySchema = z.enum(["remote", "hybrid", "onsite", "any"]);

const salaryBandSchema = z.enum(["up_to_5k", "5k_8k", "8k_12k", "12k_15k", "15k_plus"]);

const salaryRangeSchema = z.object({
  min: z.number().nonnegative(),
  max: z.number().nonnegative(),
  currency: z.literal("BRL"),
});

const onboardingStepSchema = z.enum([
  "area",
  "skills",
  "seniority",
  "modality",
  "location",
  "salary",
  "blockedSkills",
  "summary",
]);

const onboardingProgressSchema = z.object({
  currentStep: onboardingStepSchema,
  lastSavedAt: z.string().datetime(),
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
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "State is required", path: ["state"] });
    }

    if (value.scope === "city" && !value.city?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "City is required", path: ["city"] });
    }
  });

export const createProfileSchema = z.object({
  area: professionalAreaSchema.nullable().optional(),
  seniority: senioritySchema.nullable().optional(),
  modality: workModalitySchema.nullable().optional(),
  location: z.string().optional(),
  locationPreference: profileLocationSchema.nullable().optional(),
  salaryBand: salaryBandSchema.nullable().optional(),
  salaryExpectation: salaryRangeSchema.nullable().optional(),
  skillNames: z.array(z.string()).optional(),
  blockedSkills: z.array(z.string()).optional(),
  onboardingProgress: onboardingProgressSchema.nullable().optional(),
  onboardingCompleted: z.boolean().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  linkedinUrl: z.string().url().nullable().optional(),
  githubUrl: z.string().url().nullable().optional(),
  extensions: z.record(z.unknown()).optional(),
});

export const updateProfileSchema = createProfileSchema.partial();

export type CreateProfileSchemaInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileSchemaInput = z.infer<typeof updateProfileSchema>;
