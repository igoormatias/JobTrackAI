import { describe, expect, it } from "vitest";

import { parseCareerAnalysisResponse } from "./career-analysis.response-parser.js";

const validPayload = {
  summary: "Resumo",
  matchExplanation: "Explicação",
  strengths: ["React"],
  weaknesses: ["Docker"],
  missingSkills: ["Kubernetes"],
  learningRecommendations: ["Estudar Docker"],
  interviewPreparation: ["Revisar projetos"],
  careerInsights: ["Boa trilha frontend"],
  nextSteps: ["Aplicar na origem"],
  confidence: 0.85,
};

describe("parseCareerAnalysisResponse", () => {
  it("parses plain JSON", () => {
    const result = parseCareerAnalysisResponse(JSON.stringify(validPayload));
    expect(result.summary).toBe("Resumo");
    expect(result.confidence).toBe(0.85);
  });

  it("parses fenced JSON", () => {
    const result = parseCareerAnalysisResponse(`\`\`\`json\n${JSON.stringify(validPayload)}\n\`\`\``);
    expect(result.matchExplanation).toBe("Explicação");
  });

  it("rejects invalid confidence", () => {
    expect(() =>
      parseCareerAnalysisResponse(JSON.stringify({ ...validPayload, confidence: 2 })),
    ).toThrow(/Failed to parse career analysis/);
  });
});
