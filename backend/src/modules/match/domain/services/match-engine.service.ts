import {
  DASHBOARD_TOP_MATCH_THRESHOLD,
  MATCH_ENGINE_VERSION,
  MATCH_WEIGHTS,
} from "../../../../shared/domain/match-weights.js";
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

export type MatchResultDto = {
  score: number;
  label: "excellent" | "good" | "fair" | "low";
  matchedSkills: string[];
  missingSkills: MissingSkillDto[];
  reasons: MatchReasonDto[];
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

const getMatchLabel = (score: number): MatchResultDto["label"] => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "low";
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
  // Unknown area — do not assume compatible for recommendations
  return false;
};

const titleRoleScore = (profile: MatchProfileInput, job: MatchJobInput): number => {
  const title = (job.title ?? "").toLowerCase();
  if (!title) return 0;
  let score = 0;
  const weights = MATCH_WEIGHTS;

  const hints = [
    ...(profile.area ? [profile.area.replace(/_/g, " ")] : []),
    ...profile.skillNames.slice(0, 6),
  ];
  const hits = hints.filter((hint) => title.includes(hint.toLowerCase()));
  if (hits.length > 0) {
    score += Math.min(weights.titleRoleMax, 8 + hits.length * 4);
  }

  const inferred = jobTitleNormalizer.inferArea(job.title ?? "");
  if (profile.area && inferred === profile.area) {
    score = Math.max(score, weights.titleRoleMax * 0.85);
  }

  return Math.min(weights.titleRoleMax, score);
};

const skillsScore = (profile: MatchProfileInput, job: MatchJobInput, matchedSkills: string[]): number => {
  const weights = MATCH_WEIGHTS;
  if (profile.skillNames.length === 0) return weights.skillsMax * 0.35;
  const jobTerms = getJobTerms(job);
  if (jobTerms.length === 0) {
    // Manual / sparse jobs: score from title overlap only
    const title = (job.title ?? "").toLowerCase();
    const titleHits = profile.skillNames.filter((skill) =>
      title.includes(skill.toLowerCase()),
    );
    return Math.min(
      weights.skillsMax,
      (titleHits.length / Math.max(profile.skillNames.length, 1)) * weights.skillsMax,
    );
  }
  const ratio = matchedSkills.length / Math.max(Math.min(profile.skillNames.length, jobTerms.length), 1);
  return Math.min(weights.skillsMax, ratio * weights.skillsMax);
};

export class MatchEngineService {
  compute(
    profile: MatchProfileInput,
    job: MatchJobInput,
    context: MatchUserContext = {},
  ): MatchResultDto {
    const weights = MATCH_WEIGHTS;
    const reasons: MatchReasonDto[] = [];
    const jobTerms = getJobTerms(job);
    const matchedSkills = skillMatcher.findMatches(profile.skillNames, jobTerms);
    const areaCompatible = isAreaCompatible(profile, job);
    const inferredArea = jobTitleNormalizer.inferArea(job.title ?? "");

    let score = 0;

    // Area
    if (profile.area && job.area && job.area !== "other" && profile.area === job.area) {
      score += weights.areaMax;
      reasons.push({ id: "reason_area", label: "Área compatível com seu perfil", matched: true });
    } else if (profile.area && inferredArea && inferredArea === profile.area) {
      score += weights.areaMax * 0.8;
      reasons.push({
        id: "reason_title_area",
        label: "Cargo compatível com seu perfil",
        matched: true,
      });
    } else if (profile.area && !areaCompatible) {
      reasons.push({
        id: "reason_area_mismatch",
        label: "Área incompatível com seu perfil",
        matched: false,
      });
    }

    // Title / role
    const rolePts = titleRoleScore(profile, job);
    score += rolePts;
    if (rolePts > 0) {
      reasons.push({
        id: "reason_title",
        label: "Cargo alinhado às suas competências",
        matched: true,
      });
    }

    // Skills / technologies
    const skillPts = skillsScore(profile, job, matchedSkills);
    score += skillPts;
    matchedSkills.slice(0, 6).forEach((skill, index) => {
      reasons.push({ id: `reason_skill_${index}`, label: skill, matched: true });
    });

    // Seniority
    if (this.isSeniorityCompatible(profile, job) && profile.seniority) {
      score += weights.seniorityMax;
      reasons.push({ id: "reason_seniority", label: "Senioridade compatível", matched: true });
    } else if (!this.isSeniorityCompatible(profile, job) && profile.seniority) {
      score += weights.seniorityMismatchPenalty;
      reasons.push({ id: "reason_seniority", label: "Senioridade incompatível", matched: false });
    }

    // Modality
    const modalityMatch =
      !profile.modality || profile.modality === "any" || profile.modality === job.modality;
    if (modalityMatch && profile.modality) {
      score += weights.modalityMax;
      reasons.push({
        id: "reason_modality",
        label: profile.modality === "any" ? "Aceita qualquer modalidade" : "Modalidade compatível",
        matched: true,
      });
    } else if (profile.modality && profile.modality !== "any") {
      reasons.push({ id: "reason_modality", label: "Modalidade incompatível", matched: false });
    }

    // Location
    if (this.isLocationCompatible(profile, job)) {
      score += weights.locationMax;
      reasons.push({ id: "reason_location", label: "Localização compatível", matched: true });
    }

    // Soft boosts
    if (this.isSalaryCompatible(profile, job) && profile.salaryExpectation) {
      score += weights.salaryBoost;
      reasons.push({ id: "reason_salary", label: "Pretensão compatível", matched: true });
    }

    const companySlug = (job.companySlug ?? job.companyName ?? "").toLowerCase();
    if (companySlug && context.favoriteCompanySlugs?.some((slug) => companySlug.includes(slug))) {
      score += weights.favoriteCompanyBoost;
      reasons.push({
        id: "reason_favorite_company",
        label: "Empresa favorita",
        matched: true,
      });
    }
    if (companySlug && context.pipelineCompanySlugs?.some((slug) => companySlug.includes(slug))) {
      score += weights.pipelineHistoryBoost;
      reasons.push({
        id: "reason_pipeline_company",
        label: "Empresa com processo em andamento",
        matched: true,
      });
    }
    if (companySlug && context.savedJobCompanySlugs?.some((slug) => companySlug.includes(slug))) {
      score += weights.savedHistoryBoost;
    }
    if (context.jobId && context.viewedJobIds?.has(context.jobId)) {
      score += weights.viewedHistoryBoost;
    }

    let finalScore = Math.max(0, Math.min(100, Math.round(score)));
    if (profile.area && !areaCompatible) {
      finalScore = Math.min(finalScore, weights.areaIncompatibleScoreCap);
    }

    const profileSlugs = new Set(skillMatcher.canonicalizeMany(profile.skillNames));
    const missing = job.technologies
      .map((t) => t.name)
      .filter((name) => !profileSlugs.has(skillMatcher.canonicalize(name)));
    const prioritized = [
      ...missing.filter((name) => COMMON_MISSING_PRIORITY.includes(name)),
      ...missing.filter((name) => !COMMON_MISSING_PRIORITY.includes(name)),
    ].slice(0, 4);

    return {
      score: finalScore,
      label: getMatchLabel(finalScore),
      matchedSkills,
      missingSkills: prioritized.map((name, index) => ({
        id: `missing_${index + 1}`,
        name,
        slug: skillMatcher.canonicalize(name),
      })),
      reasons,
      engineVersion: MATCH_ENGINE_VERSION,
    };
  }

  private isLocationCompatible(profile: MatchProfileInput, job: MatchJobInput): boolean {
    const preference = profile.locationPreference;
    const jobLocation = job.location ?? "";
    if (job.modality === "remote") return true;
    if (!preference) {
      return profile.location
        ? jobLocation.toLowerCase().includes(profile.location.toLowerCase())
        : true;
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
    if (!expectation || job.salaryMin == null || job.salaryMax == null) return true;
    return job.salaryMax >= expectation.min && job.salaryMin <= expectation.max;
  }

  private isSeniorityCompatible(profile: MatchProfileInput, job: MatchJobInput): boolean {
    if (!profile.seniority || !job.seniority) return true;
    const profileRank = SENIORITY_RANK[profile.seniority] ?? 2;
    const jobRank = SENIORITY_RANK[job.seniority] ?? 2;
    return Math.abs(profileRank - jobRank) <= 1;
  }
}

export const matchEngineService = new MatchEngineService();
