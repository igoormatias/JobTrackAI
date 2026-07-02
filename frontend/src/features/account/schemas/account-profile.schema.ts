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

const profileLocationSchema = z
  .object({
    scope: z.enum(["country", "state", "city"]),
    state: z.string().optional(),
    city: z.string().optional(),
    acceptsRelocation: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.scope === "state" && !value.state?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Estado é obrigatório", path: ["state"] });
    }

    if (value.scope === "city" && !value.city?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Cidade é obrigatória", path: ["city"] });
    }
  });

export const accountProfileSchema = z.object({
  area: professionalAreaSchema.nullable(),
  seniority: senioritySchema.nullable(),
  modality: workModalitySchema.nullable(),
  locationPreference: profileLocationSchema,
  salaryBand: salaryBandSchema.nullable(),
  skillNames: z.array(z.string()).min(1, "Selecione ao menos uma competência"),
});

export type AccountProfileFormValues = z.infer<typeof accountProfileSchema>;
