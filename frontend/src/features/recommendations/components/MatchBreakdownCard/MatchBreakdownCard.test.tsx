import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { MatchScore } from "@/types/match";

import { MatchBreakdownCard } from "./MatchBreakdownCard";

const matchScore: MatchScore = {
  score: 83,
  label: "good",
  reasons: [],
  missingSkills: [{ id: "missing_1", name: "Node.js", slug: "node-js" }],
  engineVersion: "rules-v5",
  skillCoverage: { matched: 5, required: 6, percent: 83 },
  skillEvidence: [
    { name: "React", slug: "react", present: true },
    { name: "TypeScript", slug: "typescript", present: true },
    { name: "Node.js", slug: "node-js", present: false },
  ],
  factors: [
    {
      id: "factor_skills",
      label: "Skills",
      weight: 50,
      applicable: true,
      ratio: 0.83,
      points: 41.5,
      matched: true,
      detail: "5 de 6 skills encontradas (83%)",
    },
    {
      id: "factor_modality",
      label: "Modalidade",
      weight: 10,
      applicable: true,
      ratio: 1,
      points: 10,
      matched: true,
      detail: "Modalidade compatível",
    },
  ],
  confidence: {
    level: "high",
    score: 82,
    signals: ["Skills/requisitos extraídos"],
  },
};

describe("MatchBreakdownCard", () => {
  it("renders found/missing skills and confidence without 0/0 coverage", () => {
    render(<MatchBreakdownCard matchScore={matchScore} />);

    expect(screen.getByText("Como calculamos este Match")).toBeInTheDocument();
    expect(screen.getByText(/Cobertura: 5 de 6 · 83%/)).toBeInTheDocument();
    expect(screen.getByText("Skills encontradas")).toBeInTheDocument();
    expect(screen.getByText(/✔ React/)).toBeInTheDocument();
    expect(screen.getByText("Não encontradas")).toBeInTheDocument();
    expect(screen.getByText(/✖ Node\.js/)).toBeInTheDocument();
    expect(screen.getByText(/Confiança Alta/)).toBeInTheDocument();
    expect(screen.queryByText(/0 de 0/)).not.toBeInTheDocument();
  });

  it("hides coverage when required is zero", () => {
    render(
      <MatchBreakdownCard
        matchScore={{
          ...matchScore,
          skillCoverage: { matched: 0, required: 0, percent: 0 },
          skillEvidence: [],
        }}
      />,
    );

    expect(screen.queryByText(/Cobertura:/)).not.toBeInTheDocument();
    expect(screen.getByText(/Confiança Alta/)).toBeInTheDocument();
  });
});
