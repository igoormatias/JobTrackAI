import {
  DASHBOARD_TOP_MATCH_THRESHOLD,
  MATCH_ENGINE_VERSION,
  MATCH_WEIGHTS,
} from "../../../../shared/domain/match-weights.js";
import { canonicalizeSkill } from "../../../../shared/domain/skill-normalization.js";
import { jobTitleNormalizer } from "./job-title-normalizer.service.js";
import { skillMatcher } from "./skill-matcher.service.js";

export { DASHBOARD_TOP_MATCH_THRESHOLD };

export type MatchReasonDto = {
  id: string;
  label: string;
  matched: boolean;
};

export type MissingSkillDto = {
  id: string;
  name: string;
  slug: string;
};

export type MatchFactorDto = {
  id: string;
  label: string;
  weight: number;
  applicable: boolean;
  ratio: number;
  points: number;
  matched: boolean;
  detail: string;
};

export type SkillEvidenceDto = {
  name: string;
  slug: string;
  present: boolean;
};

export type SkillCoverageDto = {
  matched: number;
  required: number;
  percent: number;
};

export type MatchResultDto = {
  score: number;
  label: "excellent" | "good" | "fair" | "low";
  matchedSkills: string[];
  missingSkills: MissingSkillDto[];
  reasons: MatchReasonDto[];
  factors: MatchFactorDto[];
  skillEvidence: SkillEvidenceDto[];
  skillCoverage: SkillCoverageDto;
  engineVersion: typeof MATCH_ENGINE_VERSION;
};

export type MatchProfileInput = {
  area?: string | null;
  seniority?: string | null;
  modality?: string | null;
  location?: string | null;
  locationPreference?: {
    scope: "country" | "state" | "city";
    state?: string;
    city?: string;
    acceptsRelocation: boolean;
  } | null;
  salaryExpectation?: { min: number; max: number; currency: "BRL" } | null;
  skillNames: string[];
};

export type MatchJobInput = {
  title?: string;
  area?: string | null;
  seniority?: string | null;
  modality?: string | null;
  location?: string | null;
  companyName?: string | null;
  companySlug?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  technologies: Array<{ name: string; slug: string }>;
  requirements: string[];
};

export type MatchUserContext = {
  favoriteCompanySlugs?: string[];
  pipelineCompanySlugs?: string[];
  savedJobCompanySlugs?: string[];
  viewedJobIds?: Set<string>;
  jobId?: string;
};

type FactorEvaluation = {
  applicable: boolean;
  ratio: number;
  matched: boolean;
  detail: string;
};

const SENIORITY_RANK: Record<string, number> = {
  intern: 0,
  junior: 1,
  mid: 2,
  senior: 3,
  specialist: 4,
  lead: 5,
  staff: 6,
};

const COMMON_MISSING_PRIORITY = ["Docker", "AWS", "Kafka", "Kubernetes", "GraphQL", "Terraform"];

const getJobTerms = (job: MatchJobInput): string[] => {
  const techNames = job.technologies.map((tech) => tech.name);
  return [...techNames, ...job.requirements];
};

const uniqueJobTermsBySlug = (job: MatchJobInput): Array<{ name: string; slug: string }> => {
  const seen = new Set<string>();
  const terms: Array<{ name: string; slug: string }> = [];
  for (const name of getJobTerms(job)) {
    const slug = canonicalizeSkill(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    terms.push({ name, slug });
  }
  return terms;
};

const getMatchLabel = (score: number): MatchResultDto["label"] => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "low";
};

const toFactor = (
  id: string,
  label: string,
  weight: number,
  evaluation: FactorEvaluation,
): MatchFactorDto => {
  const points = evaluation.applicable ? evaluation.ratio * weight : 0;
  return {
    id,
    label,
    weight,
    applicable: evaluation.applicable,
    ratio: evaluation.applicable ? evaluation.ratio : 0,
    points,
    matched: evaluation.matched,
    detail: evaluation.detail,
  };
};

export const isAreaCompatible = (
  profile: MatchProfileInput,
  job: MatchJobInput,
): boolean => {
  if (!profile.area) return true;
  if (job.area && job.area !== "other") {
    return job.area === profile.area;
  }
  const inferredArea = jobTitleNormalizer.inferArea(job.title ?? "");
  if (inferredArea) {
    return inferredArea === profile.area;
  }
  return false;
};

export class MatchEngineService {
  compute(
    profile: MatchProfileInput,
    job: MatchJobInput,
    _context: MatchUserContext = {},
  ): MatchResultDto {
    const weights = MATCH_WEIGHTS;
    const jobTerms = uniqueJobTermsBySlug(job);
    const matchedSkills = skillMatcher.findMatches(
      profile.skillNames,
      jobTerms.map((term) => term.name),
    );

    const skillEvidence: SkillEvidenceDto[] = jobTerms.map((term) => ({
      name: term.name,
      slug: term.slug,
      present: skillMatcher.profileHasTerm(profile.skillNames, term.name),
    }));

    const matchedCount = skillEvidence.filter((item) => item.present).length;
    const requiredCount = skillEvidence.length;
    const coveragePercent =
      requiredCount > 0 ? Math.round((matchedCount / requiredCount) * 100) : 0;

    const skillCoverage: SkillCoverageDto = {
      matched: matchedCount,
      required: requiredCount,
      percent: coveragePercent,
    };

    const skillsFactor = toFactor(
      "factor_skills",
      "Skills",
      weights.skills,
      this.evaluateSkills(skillCoverage),
    );
    const seniorityFactor = toFactor(
      "factor_seniority",
      "Senioridade",
      weights.seniority,
      this.evaluateSeniority(profile, job),
    );
    const modalityFactor = toFactor(
      "factor_modality",
      "Modalidade",
      weights.modality,
      this.evaluateModality(profile, job),
    );
    const locationFactor = toFactor(
      "factor_location",
      "Localização",
      weights.location,
      this.evaluateLocation(profile, job),
    );
    const salaryFactor = toFactor(
      "factor_salary",
      "Pretensão salarial",
      weights.salary,
      this.evaluateSalary(profile, job),
    );
    const areaFactor = toFactor(
      "factor_area",
      "Área profissional",
      weights.area,
      this.evaluateArea(profile, job),
    );

    const factors = [
      skillsFactor,
      seniorityFactor,
      modalityFactor,
      locationFactor,
      salaryFactor,
      areaFactor,
    ];

    const applicable = factors.filter((factor) => factor.applicable);
    const totalWeight = applicable.reduce((sum, factor) => sum + factor.weight, 0);
    const weighted = applicable.reduce((sum, factor) => sum + factor.ratio * factor.weight, 0);
    const finalScore =
      totalWeight > 0 ? Math.max(0, Math.min(100, Math.round((weighted / totalWeight) * 100))) : 0;

    const missing = skillEvidence.filter((item) => !item.present).map((item) => item.name);
    const prioritized = [
      ...missing.filter((name) => COMMON_MISSING_PRIORITY.includes(name)),
      ...missing.filter((name) => !COMMON_MISSING_PRIORITY.includes(name)),
    ];

    const reasons = this.buildReasons(factors, skillEvidence, prioritized);

    return {
      score: finalScore,
      label: getMatchLabel(finalScore),
      matchedSkills,
      missingSkills: prioritized.map((name, index) => ({
        id: `missing_${index + 1}`,
        name,
        slug: canonicalizeSkill(name),
      })),
      reasons,
      factors,
      skillEvidence,
      skillCoverage,
      engineVersion: MATCH_ENGINE_VERSION,
    };
  }

  private evaluateSkills(coverage: SkillCoverageDto): FactorEvaluation {
    if (coverage.required === 0) {
      return {
        applicable: false,
        ratio: 0,
        matched: false,
        detail: "Vaga sem skills/requisitos identificados",
      };
    }

    const ratio = coverage.matched / coverage.required;
    return {
      applicable: true,
      ratio,
      matched: coverage.matched > 0,
      detail: `${coverage.matched} de ${coverage.required} skills encontradas (${coverage.percent}%)`,
    };
  }

  private evaluateSeniority(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (!profile.seniority || !job.seniority) {
      return {
        applicable: false,
        ratio: 0,
        matched: false,
        detail: "Senioridade não identificada em um dos lados",
      };
    }

    const compatible = this.isSeniorityCompatible(profile, job);
    return {
      applicable: true,
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible ? "Senioridade compatível" : "Senioridade incompatível",
    };
  }

  private evaluateModality(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (!profile.modality) {
      return {
        applicable: false,
        ratio: 0,
        matched: false,
        detail: "Modalidade do perfil não identificada",
      };
    }

    if (profile.modality === "any") {
      return {
        applicable: true,
        ratio: 1,
        matched: true,
        detail: "Aceita qualquer modalidade",
      };
    }

    if (!job.modality) {
      return {
        applicable: false,
        ratio: 0,
        matched: false,
        detail: "Modalidade da vaga não identificada",
      };
    }

    const compatible = profile.modality === job.modality;
    return {
      applicable: true,
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible ? "Modalidade compatível" : "Modalidade incompatível",
    };
  }

  private evaluateLocation(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (job.modality === "remote") {
      return {
        applicable: true,
        ratio: 1,
        matched: true,
        detail: "Vaga remota — localização compatível",
      };
    }

    const preference = profile.locationPreference;
    const jobLocation = job.location ?? "";

    if (!preference && !profile.location) {
      return {
        applicable: false,
        ratio: 0,
        matched: false,
        detail: "Preferência de localização não identificada",
      };
    }

    if (!jobLocation) {
      return {
        applicable: false,
        ratio: 0,
        matched: false,
        detail: "Localização da vaga não identificada",
      };
    }

    const compatible = this.isLocationCompatible(profile, job);
    return {
      applicable: true,
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible ? "Localização compatível" : "Localização incompatível",
    };
  }

  private evaluateSalary(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (!profile.salaryExpectation || job.salaryMin == null || job.salaryMax == null) {
      return {
        applicable: false,
        ratio: 0,
        matched: false,
        detail: "Pretensão salarial ou faixa da vaga não identificada",
      };
    }

    const compatible = this.isSalaryCompatible(profile, job);
    return {
      applicable: true,
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible ? "Pretensão salarial compatível" : "Pretensão salarial incompatível",
    };
  }

  private evaluateArea(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (!profile.area) {
      return {
        applicable: false,
        ratio: 0,
        matched: false,
        detail: "Área do perfil não identificada",
      };
    }

    if (job.area && job.area !== "other") {
      const compatible = job.area === profile.area;
      return {
        applicable: true,
        ratio: compatible ? 1 : 0,
        matched: compatible,
        detail: compatible ? "Área compatível com seu perfil" : "Área incompatível com seu perfil",
      };
    }

    const inferredArea = jobTitleNormalizer.inferArea(job.title ?? "");
    if (!inferredArea) {
      return {
        applicable: true,
        ratio: 0,
        matched: false,
        detail: "Área incompatível com seu perfil",
      };
    }

    const compatible = inferredArea === profile.area;
    return {
      applicable: true,
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible
        ? "Cargo compatível com seu perfil"
        : "Área incompatível com seu perfil",
    };
  }

  private buildReasons(
    factors: MatchFactorDto[],
    skillEvidence: SkillEvidenceDto[],
    prioritizedMissing: string[],
  ): MatchReasonDto[] {
    const reasons: MatchReasonDto[] = [];

    for (const factor of factors) {
      if (!factor.applicable) continue;

      if (factor.id === "factor_skills") {
        skillEvidence.forEach((item, index) => {
          reasons.push({
            id: `reason_skill_${index}`,
            label: item.name,
            matched: item.present,
          });
        });
        continue;
      }

      const reasonId =
        factor.id === "factor_area" && !factor.matched
          ? "reason_area_mismatch"
          : factor.id === "factor_area" && factor.detail.includes("Cargo")
            ? "reason_title_area"
            : factor.id.replace("factor_", "reason_");

      reasons.push({
        id: reasonId,
        label: factor.detail,
        matched: factor.matched,
      });
    }

    if (prioritizedMissing.length > 0) {
      const alreadyListed = reasons.some((reason) => reason.id.startsWith("reason_skill_"));
      if (!alreadyListed) {
        reasons.push({
          id: "reason_skills_gap",
          label: `Competências em falta: ${prioritizedMissing.slice(0, 3).join(", ")}`,
          matched: false,
        });
      }
    }

    return reasons;
  }

  private isLocationCompatible(profile: MatchProfileInput, job: MatchJobInput): boolean {
    const preference = profile.locationPreference;
    const jobLocation = job.location ?? "";
    if (job.modality === "remote") return true;
    if (!preference) {
      return profile.location
        ? jobLocation.toLowerCase().includes(profile.location.toLowerCase())
        : false;
    }
    if (preference.scope === "country") return true;
    if (preference.scope === "state" && preference.state) {
      return jobLocation.toUpperCase().includes(preference.state.toUpperCase());
    }
    if (preference.scope === "city" && preference.city) {
      return jobLocation.toLowerCase().includes(preference.city.toLowerCase());
    }
    return preference.acceptsRelocation;
  }

  private isSalaryCompatible(profile: MatchProfileInput, job: MatchJobInput): boolean {
    const expectation = profile.salaryExpectation;
    if (!expectation || job.salaryMin == null || job.salaryMax == null) return false;
    return job.salaryMax >= expectation.min && job.salaryMin <= expectation.max;
  }

  private isSeniorityCompatible(profile: MatchProfileInput, job: MatchJobInput): boolean {
    if (!profile.seniority || !job.seniority) return false;
    const profileRank = SENIORITY_RANK[profile.seniority] ?? 2;
    const jobRank = SENIORITY_RANK[job.seniority] ?? 2;
    return Math.abs(profileRank - jobRank) <= 1;
  }
}

export const matchEngineService = new MatchEngineService();
