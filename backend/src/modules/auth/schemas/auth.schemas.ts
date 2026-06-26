import { z } from "zod";

export const loginSchema = z.object({
  provider: z.literal("google"),
  idToken: z.string().optional(),
});

export const onboardingCompleteSchema = z.object({
  professionalArea: z.string().min(1),
  seniority: z.string().min(1),
  salaryExpectation: z.object({
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    currency: z.literal("BRL"),
  }),
  location: z.string().min(1),
  skills: z.array(z.string()).min(1),
  blockedSkills: z.array(z.string()).default([]),
  modality: z.enum(["remote", "hybrid", "onsite"]).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type OnboardingCompleteInput = z.infer<typeof onboardingCompleteSchema>;
