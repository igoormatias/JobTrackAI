import {
  DASHBOARD_TOP_MATCH_THRESHOLD,
  MATCH_ENGINE_VERSION,
  MATCH_WEIGHTS,
} from "../../../../shared/domain/match-weights.js";
import { canonicalizeSkill } from "../../../../shared/domain/skill-normalization.js";
import { jobTitleNormalizer } from "./job-title-normalizer.service.js";
import { skillMatcher } from "./skill-matcher.service.js";

export { DASHBOARD_TOP_MATCH_THRESHOLD };

export type FactorState = "match" | "mismatch" | "unknown";

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
  state: FactorState;
  ratio: number;
  points: number;
  matched: boolean;
  detail: string;
};

export type MatchGroupDto = {
  id: "technical" | "jobFit";
  label: string;
  weight: number;
  applicable: boolean;
  score: number | null;
  factorIds: string[];
};

export type MatchConfidenceDto = {
  level: "high" | "medium" | "low";
  score: number;
  signals: string[];
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
  groups: MatchGroupDto[];
  skillEvidence: SkillEvidenceDto[];
  skillCoverage: SkillCoverageDto;
  confidence: MatchConfidenceDto;
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
  description?: string | null;
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
  state: FactorState;
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
  const applicable = evaluation.state !== "unknown";
  const points = applicable ? evaluation.ratio * weight : 0;
  return {
    id,
    label,
    weight,
    applicable,
    state: evaluation.state,
    ratio: applicable ? evaluation.ratio : 0,
    points,
    matched: evaluation.matched,
    detail: evaluation.detail,
  };
};

const scoreGroup = (factors: MatchFactorDto[]): number | null => {
  const known = factors.filter((factor) => factor.applicable);
  if (known.length === 0) return null;
  const totalWeight = known.reduce((sum, factor) => sum + factor.weight, 0);
  if (totalWeight <= 0) return null;
  const weighted = known.reduce((sum, factor) => sum + factor.ratio * factor.weight, 0);
  return Math.max(0, Math.min(100, Math.round((weighted / totalWeight) * 100)));
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
  return true;
};

export class MatchEngineService {
  compute(
    profile: MatchProfileInput,
    job: MatchJobInput,
    context: MatchUserContext = {},
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
      weights.technical.skills,
      this.evaluateSkills(skillCoverage),
    );
    const seniorityFactor = toFactor(
      "factor_seniority",
      "Senioridade",
      weights.technical.seniority,
      this.evaluateSeniority(profile, job),
    );
    const areaFactor = toFactor(
      "factor_area",
      "Área profissional",
      weights.technical.area,
      this.evaluateArea(profile, job),
    );
    const modalityFactor = toFactor(
      "factor_modality",
      "Modalidade",
      weights.jobFit.modality,
      this.evaluateModality(profile, job),
    );
    const locationFactor = toFactor(
      "factor_location",
      "Localização",
      weights.jobFit.location,
      this.evaluateLocation(profile, job),
    );
    const salaryFactor = toFactor(
      "factor_salary",
      "Pretensão salarial",
      weights.jobFit.salary,
      this.evaluateSalary(profile, job),
    );

    const technicalFactors = [skillsFactor, seniorityFactor, areaFactor];
    const jobFitFactors = [modalityFactor, locationFactor, salaryFactor];
    const factors = [...technicalFactors, ...jobFitFactors];

    const technicalScore = scoreGroup(technicalFactors);
    const jobFitScore = scoreGroup(jobFitFactors);

    const groups: MatchGroupDto[] = [
      {
        id: "technical",
        label: "Compatibilidade técnica",
        weight: weights.groups.technical,
        applicable: technicalScore != null,
        score: technicalScore,
        factorIds: technicalFactors.map((factor) => factor.id),
      },
      {
        id: "jobFit",
        label: "Compatibilidade da vaga",
        weight: weights.groups.jobFit,
        applicable: jobFitScore != null,
        score: jobFitScore,
        factorIds: jobFitFactors.map((factor) => factor.id),
      },
    ];

    const applicableGroups = groups.filter((group) => group.applicable && group.score != null);
    const totalGroupWeight = applicableGroups.reduce((sum, group) => sum + group.weight, 0);
    const weightedGroupScore = applicableGroups.reduce(
      (sum, group) => sum + (group.score ?? 0) * group.weight,
      0,
    );
    const finalScore =
      totalGroupWeight > 0
        ? Math.max(0, Math.min(100, Math.round(weightedGroupScore / totalGroupWeight)))
        : 50;

    const missing = skillEvidence.filter((item) => !item.present).map((item) => item.name);
    const prioritized = [
      ...missing.filter((name) => COMMON_MISSING_PRIORITY.includes(name)),
      ...missing.filter((name) => !COMMON_MISSING_PRIORITY.includes(name)),
    ];

    const reasons = this.buildReasons(factors, skillEvidence, prioritized, job, context);
    const confidence = this.buildConfidence(factors, skillCoverage, job);

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
      groups,
      skillEvidence,
      skillCoverage,
      confidence,
      engineVersion: MATCH_ENGINE_VERSION,
    };
  }

  private evaluateSkills(coverage: SkillCoverageDto): FactorEvaluation {
    if (coverage.required === 0) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Vaga sem skills/requisitos identificados",
      };
    }

    const ratio = coverage.matched / coverage.required;
    return {
      state: coverage.matched > 0 ? "match" : "mismatch",
      ratio,
      matched: coverage.matched > 0,
      detail: `${coverage.matched} de ${coverage.required} skills encontradas (${coverage.percent}%)`,
    };
  }

  private evaluateSeniority(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (!profile.seniority || !job.seniority) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Senioridade não identificada",
      };
    }

    const compatible = this.isSeniorityCompatible(profile, job);
    return {
      state: compatible ? "match" : "mismatch",
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible ? "Senioridade compatível" : "Senioridade incompatível",
    };
  }

  private evaluateModality(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (!profile.modality) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Modalidade do perfil não identificada",
      };
    }

    if (profile.modality === "any") {
      return {
        state: "match",
        ratio: 1,
        matched: true,
        detail: "Aceita qualquer modalidade",
      };
    }

    if (!job.modality) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Modalidade da vaga não identificada",
      };
    }

    const compatible = profile.modality === job.modality;
    return {
      state: compatible ? "match" : "mismatch",
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible ? "Modalidade compatível" : "Modalidade incompatível",
    };
  }

  private evaluateLocation(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (job.modality === "remote") {
      return {
        state: "match",
        ratio: 1,
        matched: true,
        detail: "Vaga remota — localização compatível",
      };
    }

    const preference = profile.locationPreference;
    const jobLocation = job.location ?? "";

    if (!preference && !profile.location) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Preferência de localização não identificada",
      };
    }

    if (!jobLocation) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Localização da vaga não identificada",
      };
    }

    const compatible = this.isLocationCompatible(profile, job);
    return {
      state: compatible ? "match" : "mismatch",
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible ? "Localização compatível" : "Localização incompatível",
    };
  }

  private evaluateSalary(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (!profile.salaryExpectation || job.salaryMin == null || job.salaryMax == null) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Pretensão salarial ou faixa da vaga não identificada",
      };
    }

    const compatible = this.isSalaryCompatible(profile, job);
    return {
      state: compatible ? "match" : "mismatch",
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible ? "Pretensão salarial compatível" : "Pretensão salarial incompatível",
    };
  }

  private evaluateArea(profile: MatchProfileInput, job: MatchJobInput): FactorEvaluation {
    if (!profile.area) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Área do perfil não identificada",
      };
    }

    if (job.area && job.area !== "other") {
      const compatible = job.area === profile.area;
      return {
        state: compatible ? "match" : "mismatch",
        ratio: compatible ? 1 : 0,
        matched: compatible,
        detail: compatible ? "Área compatível com seu perfil" : "Área incompatível com seu perfil",
      };
    }

    const inferredArea = jobTitleNormalizer.inferArea(job.title ?? "");
    if (!inferredArea) {
      return {
        state: "unknown",
        ratio: 0,
        matched: false,
        detail: "Área da vaga não identificada",
      };
    }

    const compatible = inferredArea === profile.area;
    return {
      state: compatible ? "match" : "mismatch",
      ratio: compatible ? 1 : 0,
      matched: compatible,
      detail: compatible
        ? "Cargo compatível com seu perfil"
        : "Área incompatível com seu perfil",
    };
  }

  private buildConfidence(
    factors: MatchFactorDto[],
    skillCoverage: SkillCoverageDto,
    job: MatchJobInput,
  ): MatchConfidenceDto {
    const signals: string[] = [];
    let points = 0;

    const knownFactors = factors.filter((factor) => factor.applicable).length;
    if (knownFactors >= 5) {
      points += 35;
      signals.push("Maioria dos fatores conhecidos");
    } else if (knownFactors >= 3) {
      points += 20;
      signals.push("Alguns fatores conhecidos");
    } else {
      signals.push("Poucos fatores conhecidos");
    }

    if (skillCoverage.required >= 4) {
      points += 25;
      signals.push("Skills/requisitos extraídos");
    } else if (skillCoverage.required > 0) {
      points += 12;
      signals.push("Algumas skills identificadas");
    } else {
      signals.push("Sem tecnologias/requisitos identificados");
    }

    const descriptionLength = (job.description ?? "").trim().length;
    if (descriptionLength >= 400) {
      points += 20;
      signals.push("Descrição completa");
    } else if (descriptionLength >= 120) {
      points += 10;
      signals.push("Descrição parcial");
    } else {
      signals.push("Descrição curta ou ausente");
    }

    if (job.salaryMin != null && job.salaryMax != null) {
      points += 10;
      signals.push("Salário informado");
    }
    if (job.modality) {
      points += 10;
      signals.push("Modalidade conhecida");
    }

    const score = Math.max(0, Math.min(100, points));
    const level = score >= 70 ? "high" : score >= 40 ? "medium" : "low";
    return { level, score, signals };
  }

  private buildReasons(
    factors: MatchFactorDto[],
    skillEvidence: SkillEvidenceDto[],
    prioritizedMissing: string[],
    job: MatchJobInput,
    context: MatchUserContext,
  ): MatchReasonDto[] {
    const reasons: MatchReasonDto[] = [];

    for (const factor of factors) {
      if (!factor.applicable) continue;

      if (factor.id === "factor_skills") {
        skillEvidence
          .filter((item) => item.present)
          .forEach((item, index) => {
            reasons.push({
              id: `reason_skill_${index}`,
              label: `${item.name} encontrado`,
              matched: true,
            });
          });
        continue;
      }

      if (!factor.matched) continue;

      const reasonId =
        factor.id === "factor_area" && factor.detail.includes("Cargo")
          ? "reason_title_area"
          : factor.id.replace("factor_", "reason_");

      reasons.push({
        id: reasonId,
        label: factor.detail,
        matched: true,
      });
    }

    const companySlug = (job.companySlug ?? job.companyName ?? "").toLowerCase();
    if (companySlug && context.favoriteCompanySlugs?.some((slug) => companySlug.includes(slug))) {
      reasons.push({
        id: "reason_favorite_company",
        label: "Empresa favorita",
        matched: true,
      });
    }
    if (companySlug && context.pipelineCompanySlugs?.some((slug) => companySlug.includes(slug))) {
      reasons.push({
        id: "reason_pipeline_company",
        label: "Empresa com processo em andamento",
        matched: true,
      });
    }
    if (companySlug && context.savedJobCompanySlugs?.some((slug) => companySlug.includes(slug))) {
      reasons.push({
        id: "reason_saved_company",
        label: "Empresa já salva",
        matched: true,
      });
    }

    if (prioritizedMissing.length > 0) {
      reasons.push({
        id: "reason_skills_gap",
        label: `Competências em falta: ${prioritizedMissing.slice(0, 3).join(", ")}`,
        matched: false,
      });
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
