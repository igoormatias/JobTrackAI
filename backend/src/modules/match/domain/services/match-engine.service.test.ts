import { describe, expect, it } from "vitest";

import type { MatchJobInput, MatchProfileInput } from "./match-engine.service.js";
import { MatchEngineService } from "./match-engine.service.js";

const frontendProfile: MatchProfileInput = {
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "São Paulo",
  salaryExpectation: { min: 10000, max: 16000, currency: "BRL" },
  skillNames: ["React", "TypeScript", "Next.js", "GraphQL", "Docker"],
};

const frontendJob: MatchJobInput = {
  title: "Frontend Developer",
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "São Paulo, SP",
  salaryMin: 10000,
  salaryMax: 15000,
  description: "Vaga para trabalhar com React, TypeScript e Next.js em times ágeis.",
  technologies: [
    { name: "React", slug: "react" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Next.js", slug: "next-js" },
    { name: "GraphQL", slug: "graphql" },
    { name: "Docker", slug: "docker" },
    { name: "Node.js", slug: "node-js" },
  ],
  requirements: ["React", "TypeScript"],
};

describe("MatchEngineService", () => {
  const engine = new MatchEngineService();

  it("returns rules-v5 engine version", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.engineVersion).toBe("rules-v5");
  });

  it("scores skill coverage as matched/required (5 of 6 = 83%)", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.skillCoverage).toEqual({ matched: 5, required: 6, percent: 83 });
    expect(result.groups.some((group) => group.id === "technical" && group.applicable)).toBe(true);
  });

  it("does not penalize missing salary data", () => {
    const withoutSalary = engine.compute(
      { ...frontendProfile, salaryExpectation: null },
      { ...frontendJob, salaryMin: null, salaryMax: null },
    );
    const salaryFactor = withoutSalary.factors.find((factor) => factor.id === "factor_salary");
    expect(salaryFactor?.state).toBe("unknown");
    expect(withoutSalary.score).toBeGreaterThan(70);
  });

  it("treats unknown area as unknown instead of mismatch", () => {
    const sparseJob: MatchJobInput = {
      title: "Vaga especial sem área clara",
      area: "other",
      seniority: null,
      modality: "remote",
      location: null,
      salaryMin: null,
      salaryMax: null,
      technologies: [{ name: "React", slug: "react" }],
      requirements: [],
      description: "React",
    };
    const result = engine.compute(frontendProfile, sparseJob);
    const areaFactor = result.factors.find((factor) => factor.id === "factor_area");
    expect(areaFactor?.state).toBe("unknown");
    expect(result.score).toBeGreaterThan(0);
  });

  it("scores Portuguese React developer title without collapsing to 0%", () => {
    const job: MatchJobInput = {
      title: "Desenvolvedor React - Sênior",
      area: "other",
      seniority: null,
      modality: "remote",
      location: null,
      salaryMin: null,
      salaryMax: null,
      technologies: [{ name: "React", slug: "react" }],
      requirements: [],
      description: "Desenvolvedor React",
    };
    const result = engine.compute(frontendProfile, job);
    expect(result.score).toBeGreaterThan(50);
    expect(result.skillCoverage.matched).toBeGreaterThan(0);
  });

  it("keeps sparse unrelated jobs with low confidence when area is unknown", () => {
    const lawyerJob: MatchJobInput = {
      title: "Advogado Pleno - Direito Bancário",
      area: "other",
      seniority: "mid",
      modality: "remote",
      location: "Remoto",
      technologies: [],
      requirements: [],
      description: "short",
    };
    const result = engine.compute(frontendProfile, lawyerJob);
    const areaFactor = result.factors.find((factor) => factor.id === "factor_area");
    expect(areaFactor?.state).toBe("unknown");
    expect(result.confidence.level).toMatch(/low|medium/);
    expect(result.skillCoverage.required).toBe(0);
  });

  it("matches skills via aliases (ReactJS)", () => {
    const jobWithAlias: MatchJobInput = {
      ...frontendJob,
      technologies: [{ name: "ReactJS", slug: "reactjs" }],
      requirements: ["ReactJS"],
    };
    const result = engine.compute(frontendProfile, jobWithAlias);
    expect(result.matchedSkills).toContain("React");
  });

  it("adds affinity reasons without changing score", () => {
    const without = engine.compute(frontendProfile, {
      ...frontendJob,
      companySlug: "nubank",
    });
    const withFavorite = engine.compute(
      frontendProfile,
      { ...frontendJob, companySlug: "nubank" },
      { favoriteCompanySlugs: ["nubank"] },
    );
    expect(withFavorite.score).toBe(without.score);
    expect(withFavorite.reasons.some((reason) => reason.id === "reason_favorite_company")).toBe(
      true,
    );
  });

  it("exposes confidence metadata", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.confidence.level).toMatch(/high|medium|low/);
    expect(result.confidence.signals.length).toBeGreaterThan(0);
  });

  it("never invents proficiency language in reasons", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    const labels = result.reasons.map((reason) => reason.label.toLowerCase()).join(" ");
    expect(labels).not.toMatch(/intermedi[aá]rio|avan[cç]ado|especialista|b[aá]sico|dom[ií]nio/);
  });
});
