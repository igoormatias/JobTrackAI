import { z } from "zod";

import type { OnboardingStep } from "../types/onboarding.types";

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

export const areaStepSchema = z.object({
  area: professionalAreaSchema,
});

export const skillsStepSchema = z.object({
  skills: z.array(z.string()).min(1, "Selecione ao menos uma competência").max(15),
});

export const seniorityStepSchema = z.object({
  seniority: senioritySchema,
});

export const modalityStepSchema = z.object({
  modality: workModalitySchema,
});

export const locationStepSchema = z.object({
  locationPreference: profileLocationSchema,
});

export const salaryStepSchema = z.object({
  salaryBand: salaryBandSchema,
});

export const onboardingFormSchema = z.object({
  area: professionalAreaSchema,
  skills: z.array(z.string()).min(1).max(15),
  seniority: senioritySchema,
  modality: workModalitySchema,
  locationPreference: profileLocationSchema,
  salaryBand: salaryBandSchema,
});

export const stepSchemas: Record<OnboardingStep, z.ZodTypeAny> = {
  area: areaStepSchema,
  skills: skillsStepSchema,
  seniority: seniorityStepSchema,
  modality: modalityStepSchema,
  location: locationStepSchema,
  salary: salaryStepSchema,
  summary: onboardingFormSchema,
};

export type OnboardingFormValues = z.infer<typeof onboardingFormSchema>;
