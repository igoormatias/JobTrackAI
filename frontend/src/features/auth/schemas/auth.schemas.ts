import { z } from "zod";

export const loginSchema = z.object({
  provider: z.literal("google"),
  idToken: z.string().min(1),
});

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  avatar: z.string().nullable(),
  provider: z.literal("google"),
  createdAt: z.string(),
  onboardingCompleted: z.boolean(),
});

export const authResponseSchema = z.object({
  user: authUserSchema,
  profile: z
    .object({
      professionalArea: z.string().optional(),
      seniority: z.string().optional(),
      location: z.string().optional(),
      skills: z.array(z.string()).optional(),
    })
    .nullable(),
  permissions: z.object({
    canAccessApp: z.boolean(),
    canManageSettings: z.boolean(),
  }),
});
