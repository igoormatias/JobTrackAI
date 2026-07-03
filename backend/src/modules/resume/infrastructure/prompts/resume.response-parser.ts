import { z } from "zod";

import type { ResumeStructuredContent } from "../../domain/entities/resume.entity.js";
import { EMPTY_RESUME_CONTENT } from "../../domain/entities/resume.entity.js";
import type { ResumeJobAnalysisResult } from "../../domain/entities/resume-analysis.entity.js";

const extractJson = (text: string): string => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) return fenced[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
};

const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
});

const structureSchema = z.object({
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

export const parseResumeStructureResponse = (text: string): ResumeStructuredContent => {
  const parsed = structureSchema.parse(JSON.parse(extractJson(text)));
  return { ...EMPTY_RESUME_CONTENT, ...parsed };
};

const analysisSchema = z.object({
  summary: z.string(),
  atsScore: z.number().min(0).max(100),
  atsBreakdown: z.object({
    keywords: z.number(),
    formatting: z.number(),
    structure: z.number(),
    relevance: z.number(),
  }),
  technicalCompatibility: z.number().min(0).max(100),
  behavioralCompatibility: z.number().min(0).max(100).nullable(),
  strengths: z.array(z.string()),
  gaps: z.array(z.string()),
  missingSkills: z.array(z.string()),
  underusedExperiences: z.array(z.string()),
  improvementRanking: z.array(
    z.object({
      title: z.string(),
      impact: z.string(),
      priority: z.number(),
    }),
  ),
  suggestions: z.array(
    z.object({
      type: z.string(),
      section: z.string(),
      reason: z.string(),
      impact: z.string(),
      suggestedText: z.string(),
    }),
  ),
  confidence: z.number().min(0).max(1),
});

export const parseResumeJobAnalysisResponse = (
  text: string,
  matchScore: number,
  matchedSkillsCount: number,
  missingSkillsCount: number,
): ResumeJobAnalysisResult => {
  const parsed = analysisSchema.parse(JSON.parse(extractJson(text)));
  return {
    ...parsed,
    matchScore,
    matchedSkillsCount,
    missingSkillsCount,
  };
};

export const fallbackStructureFromText = (rawText: string): ResumeStructuredContent => ({
  ...EMPTY_RESUME_CONTENT,
  professionalSummary: rawText.slice(0, 4000),
});
