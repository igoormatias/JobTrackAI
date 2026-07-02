import { MATCH_ENGINE_VERSION, MATCH_WEIGHTS } from "../../../../shared/domain/match-weights.js";

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
  blockedSkills: string[];
};

export type MatchJobInput = {
  area?: string | null;
  seniority?: string | null;
  modality?: string | null;
  location?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  technologies: Array<{ name: string; slug: string }>;
  requirements: string[];
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

const normalize = (value: string): string => value.toLowerCase().trim();

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

export class MatchEngineService {
  compute(profile: MatchProfileInput, job: MatchJobInput): MatchResultDto {
    const weights = MATCH_WEIGHTS;
    let score = weights.baseScore;
    const reasons: MatchReasonDto[] = [];

    const jobTerms = getJobTerms(job).map(normalize);
    const matchedSkills = profile.skillNames.filter((skill) => {
      const normalized = normalize(skill);
      return jobTerms.some((term) => term.includes(normalized) || normalized.includes(term));
    });

    matchedSkills.forEach((skill, index) => {
      score += weights.skillMatch;
      reasons.push({ id: `reason_skill_${index}`, label: `${skill} encontrado`, matched: true });
    });

    if (profile.area && job.area && profile.area === job.area) {
      score += 5;
      reasons.push({ id: "reason_area", label: "Área compatível", matched: true });
    }

    const modalityMatch =
      !profile.modality || profile.modality === "any" || profile.modality === job.modality;
    if (modalityMatch && profile.modality) {
      score += weights.modalityMatch;
      reasons.push({
        id: "reason_modality",
        label: profile.modality === "any" ? "Aceita qualquer modalidade" : "Modalidade compatível",
        matched: true,
      });
    } else if (profile.modality) {
      reasons.push({ id: "reason_modality", label: "Modalidade incompatível", matched: false });
    }

    if (this.isLocationCompatible(profile, job)) {
      score += weights.locationMatch;
      reasons.push({ id: "reason_location", label: "Localização compatível", matched: true });
    }

    if (this.isSalaryCompatible(profile, job)) {
      score += weights.salaryMatch;
      reasons.push({ id: "reason_salary", label: "Pretensão compatível", matched: true });
    }

    const blockedInJob = profile.blockedSkills.filter((blocked) => {
      const normalized = normalize(blocked);
      return jobTerms.some((term) => term.includes(normalized) || normalized.includes(term));
    });
    if (blockedInJob.length > 0) {
      score += weights.blockedSkillPenalty * blockedInJob.length;
      blockedInJob.forEach((skill, index) => {
        reasons.push({ id: `reason_blocked_${index}`, label: `${skill} bloqueado`, matched: false });
      });
    }

    if (!this.isSeniorityCompatible(profile, job) && profile.seniority) {
      score += weights.seniorityMismatchPenalty;
      reasons.push({ id: "reason_seniority", label: "Senioridade incompatível", matched: false });
    }

    const finalScore = Math.max(0, Math.min(100, score));
    const profileSkills = new Set(profile.skillNames.map(normalize));
    const missing = job.technologies
      .map((t) => t.name)
      .filter((name) => !profileSkills.has(normalize(name)));
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
        slug: name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, ""),
      })),
      reasons,
      engineVersion: MATCH_ENGINE_VERSION,
    };
  }

  private isLocationCompatible(profile: MatchProfileInput, job: MatchJobInput): boolean {
    const preference = profile.locationPreference;
    const jobLocation = job.location ?? "";
    if (!preference) {
      return profile.location ? jobLocation.toLowerCase().includes(profile.location.toLowerCase()) : true;
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
