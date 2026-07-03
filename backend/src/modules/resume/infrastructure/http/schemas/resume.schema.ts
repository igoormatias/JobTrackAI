import { z } from "zod";

const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
});

export const resumeContentSchema = z.object({
  fullName: z.string().nullable().optional(),
  professionalSummary: z.string().default(""),
  experiences: z.array(experienceSchema).default([]),
  education: z
    .array(
      z.object({
        institution: z.string(),
        degree: z.string().nullable().optional(),
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
      }),
    )
    .default([]),
  certifications: z
    .array(
      z.object({
        name: z.string(),
        issuer: z.string().nullable().optional(),
        date: z.string().nullable().optional(),
      }),
    )
    .default([]),
  languages: z
    .array(
      z.object({
        name: z.string(),
        level: z.string().nullable().optional(),
      }),
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().default(""),
        technologies: z.array(z.string()).default([]),
      }),
    )
    .default([]),
  softSkills: z.array(z.string()).default([]),
  hardSkills: z.array(z.string()).default([]),
});

export const updateResumeSchema = z.object({
  content: resumeContentSchema,
  source: z.enum(["manual", "paste", "upload", "import_ai", "suggestion"]).default("manual"),
});

export const importTextSchema = z.object({
  text: z.string().min(10, "Texto muito curto"),
});

export const analyzeJobSchema = z.object({
  url: z.string().url(),
});

export const applySuggestionSchema = z.object({
  editedText: z.string().optional(),
});

export type UpdateResumeBody = z.infer<typeof updateResumeSchema>;
export type ImportTextBody = z.infer<typeof importTextSchema>;
export type AnalyzeJobBody = z.infer<typeof analyzeJobSchema>;
