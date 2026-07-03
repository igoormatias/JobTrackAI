import { z } from "zod";

export const careerAnalysisResultSchema = z.object({
  summary: z.string().min(1),
  matchExplanation: z.string().min(1),
  strengths: z.array(z.string()).max(8),
  weaknesses: z.array(z.string()).max(8),
  missingSkills: z.array(z.string()).max(12),
  learningRecommendations: z.array(z.string()).max(8),
  interviewPreparation: z.array(z.string()).max(8),
  careerInsights: z.array(z.string()).max(6),
  nextSteps: z.array(z.string()).max(8),
  confidence: z.number().min(0).max(1),
});

export type CareerAnalysisResultSchema = z.infer<typeof careerAnalysisResultSchema>;

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) return trimmed;

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) return fenceMatch[1].trim();

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

export const parseCareerAnalysisResponse = (raw: string): CareerAnalysisResultSchema => {
  try {
    const jsonText = extractJsonObject(raw);
    const parsed = JSON.parse(jsonText) as unknown;
    const validated = careerAnalysisResultSchema.parse(parsed);
    return {
      summary: validated.summary.trim(),
      matchExplanation: validated.matchExplanation.trim(),
      strengths: validated.strengths.map((s) => s.trim()),
      weaknesses: validated.weaknesses.map((s) => s.trim()),
      missingSkills: validated.missingSkills.map((s) => s.trim()),
      learningRecommendations: validated.learningRecommendations.map((s) => s.trim()),
      interviewPreparation: validated.interviewPreparation.map((s) => s.trim()),
      careerInsights: validated.careerInsights.map((s) => s.trim()),
      nextSteps: validated.nextSteps.map((s) => s.trim()),
      confidence: validated.confidence,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid AI response";
    throw new Error(`Failed to parse career analysis: ${message}`);
  }
};
