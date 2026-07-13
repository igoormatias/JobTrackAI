import { describe, expect, it } from "vitest";

import type { MatchJobInput, MatchProfileInput } from "./match-engine.service.js";
import { isAreaCompatible, MatchEngineService } from "./match-engine.service.js";

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

  it("returns rules-v4 engine version", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.engineVersion).toBe("rules-v4");
  });

  it("scores skill coverage as matched/required (5 of 6 = 83%)", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.skillCoverage).toEqual({ matched: 5, required: 6, percent: 83 });
    expect(result.skillEvidence.filter((item) => item.present)).toHaveLength(5);
    expect(result.skillEvidence.some((item) => item.name === "Node.js" && !item.present)).toBe(true);
  });

  it("exposes weighted factors with evidence", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.factors.map((factor) => factor.id)).toEqual([
      "factor_skills",
      "factor_seniority",
      "factor_modality",
      "factor_location",
      "factor_salary",
      "factor_area",
    ]);
    expect(result.factors.every((factor) => factor.applicable)).toBe(true);
    expect(result.score).toBeGreaterThan(70);
  });

  it("includes missing skills from technologies and requirements", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.missingSkills.some((s) => s.name === "Node.js")).toBe(true);
  });

  it("does not penalize missing salary data", () => {
    const withoutSalary = engine.compute(
      { ...frontendProfile, salaryExpectation: null },
      { ...frontendJob, salaryMin: null, salaryMax: null },
    );
    const salaryFactor = withoutSalary.factors.find((factor) => factor.id === "factor_salary");
    expect(salaryFactor?.applicable).toBe(false);
    expect(withoutSalary.score).toBeGreaterThan(70);
  });

  it("scores lower for incompatible area without opaque cap", () => {
    const devOpsJob: MatchJobInput = {
      title: "DevOps Engineer",
      area: "devops",
      seniority: "senior",
      modality: "remote",
      location: "São Paulo, SP",
      salaryMin: 10000,
      salaryMax: 15000,
      technologies: [{ name: "React", slug: "react" }],
      requirements: ["React"],
    };

    const result = engine.compute(frontendProfile, devOpsJob);
    const areaFactor = result.factors.find((factor) => factor.id === "factor_area");
    expect(areaFactor?.matched).toBe(false);
    expect(result.reasons.some((r) => r.id === "reason_area_mismatch")).toBe(true);
    expect(result.score).toBeLessThan(100);
  });

  it("never scores Advogado highly for frontend profile", () => {
    const lawyerJob: MatchJobInput = {
      title: "Advogado Pleno - Direito Bancário",
      area: "other",
      seniority: "mid",
      modality: "remote",
      location: "Remoto",
      technologies: [],
      requirements: [],
    };
    const result = engine.compute(frontendProfile, lawyerJob);
    expect(result.score).toBeLessThan(90);
    expect(isAreaCompatible(frontendProfile, lawyerJob)).toBe(false);
  });

  it("matches skills via aliases (ReactJS)", () => {
    const jobWithAlias: MatchJobInput = {
      ...frontendJob,
      technologies: [{ name: "ReactJS", slug: "reactjs" }],
      requirements: ["ReactJS"],
    };
    const result = engine.compute(frontendProfile, jobWithAlias);
    expect(result.matchedSkills).toContain("React");
    expect(result.skillCoverage.matched).toBe(1);
    expect(result.skillCoverage.required).toBe(1);
  });

  it("infers compatible area from title when job.area is missing", () => {
    const job: MatchJobInput = {
      ...frontendJob,
      area: null,
      title: "React Developer",
    };
    expect(isAreaCompatible(frontendProfile, job)).toBe(true);
    const result = engine.compute(frontendProfile, job);
    expect(result.reasons.some((r) => r.id === "reason_title_area" && r.matched)).toBe(true);
  });

  it("treats explicit devops area as incompatible with frontend profile", () => {
    const job: MatchJobInput = {
      title: "React Developer",
      area: "devops",
      seniority: "senior",
      modality: "remote",
      location: "SP",
      technologies: [{ name: "React", slug: "react" }],
      requirements: [],
    };
    expect(isAreaCompatible(frontendProfile, job)).toBe(false);
  });

  it("scores manual jobs from tech without description requirements", () => {
    const manualJob: MatchJobInput = {
      title: "Senior React Engineer",
      area: "frontend",
      seniority: "senior",
      modality: "remote",
      location: "Remoto",
      technologies: [
        { name: "React", slug: "react" },
        { name: "TypeScript", slug: "typescript" },
      ],
      requirements: [],
    };
    const result = engine.compute(frontendProfile, manualJob);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.skillCoverage.percent).toBe(100);
  });

  it("does not change score for favorite company context in v4", () => {
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
  });

  it("never invents proficiency language in reasons", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    const labels = result.reasons.map((reason) => reason.label.toLowerCase()).join(" ");
    expect(labels).not.toMatch(/intermedi[aá]rio|avan[cç]ado|especialista|b[aá]sico|dom[ií]nio/);
  });
});
