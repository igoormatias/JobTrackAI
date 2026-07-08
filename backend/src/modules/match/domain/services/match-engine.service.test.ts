import { describe, expect, it } from "vitest";

import type { MatchJobInput, MatchProfileInput } from "./match-engine.service.js";
import { isAreaCompatible, MatchEngineService } from "./match-engine.service.js";

const frontendProfile: MatchProfileInput = {
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "São Paulo",
  skillNames: ["React", "TypeScript", "Next.js"],
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
    { name: "Docker", slug: "docker" },
  ],
  requirements: ["React", "TypeScript"],
};

describe("MatchEngineService", () => {
  const engine = new MatchEngineService();

  it("returns rules-v3 engine version", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.engineVersion).toBe("rules-v3");
  });

  it("scores higher when skills and area match", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.score).toBeGreaterThan(70);
    expect(result.matchedSkills).toContain("React");
    expect(result.matchedSkills).toContain("TypeScript");
    expect(result.reasons.some((r) => r.id === "reason_area" && r.matched)).toBe(true);
  });

  it("includes missing skills from job technologies", () => {
    const result = engine.compute(frontendProfile, frontendJob);
    expect(result.missingSkills.some((s) => s.name === "Docker")).toBe(true);
  });

  it("caps score for DevOps job with React when profile is Frontend", () => {
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
    expect(result.score).toBeLessThanOrEqual(35);
    expect(result.reasons.some((r) => r.id === "reason_area_mismatch")).toBe(true);
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
    expect(result.score).toBeLessThan(60);
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

  it("scores manual jobs from title and tech without description requirements", () => {
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
  });

  it("boosts score for favorite company context", () => {
    const without = engine.compute(frontendProfile, {
      ...frontendJob,
      companySlug: "nubank",
    });
    const withFavorite = engine.compute(
      frontendProfile,
      { ...frontendJob, companySlug: "nubank" },
      { favoriteCompanySlugs: ["nubank"] },
    );
    expect(withFavorite.score).toBeGreaterThan(without.score);
  });

  it("keeps incompatible area below dashboard threshold", () => {
    const result = engine.compute(frontendProfile, {
      title: "Advogado Pleno",
      area: "other",
      seniority: "mid",
      modality: "hybrid",
      location: "São Paulo",
      technologies: [],
      requirements: [],
    });
    expect(result.score).toBeLessThan(60);
  });
});
