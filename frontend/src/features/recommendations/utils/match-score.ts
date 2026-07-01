import type { Job } from "@/types/job";
import type { MatchScore } from "@/types/match";
import type { Seniority } from "@/types/profile";

import { MATCH_WEIGHTS } from "../constants/match-weights";
import type { RecommendationProfile } from "../types/recommendation.types";

const SENIORITY_RANK: Record<Seniority, number> = {
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

const getJobTerms = (job: Job): string[] => {
  const techNames = job.technologies.map((tech) => tech.name);
  return [...techNames, ...job.requirements];
};

const findMatchingSkills = (profile: RecommendationProfile, job: Job): string[] => {
  if (profile.skillNames.length === 0) return [];

  const jobTerms = getJobTerms(job).map(normalize);

  return profile.skillNames.filter((skill) => {
    const normalized = normalize(skill);
    return jobTerms.some((term) => term.includes(normalized) || normalized.includes(term));
  });
};

const findBlockedSkillsInJob = (profile: RecommendationProfile, job: Job): string[] => {
  if (profile.blockedSkills.length === 0) return [];

  const jobTerms = getJobTerms(job).map(normalize);

  return profile.blockedSkills.filter((blocked) => {
    const normalized = normalize(blocked);
    return jobTerms.some((term) => term.includes(normalized) || normalized.includes(term));
  });
};

const isModalityCompatible = (profile: RecommendationProfile, job: Job): boolean => {
  if (!profile.modality || profile.modality === "any") return true;
  return profile.modality === job.modality;
};

const isLocationCompatible = (profile: RecommendationProfile, job: Job): boolean => {
  const preference = profile.locationPreference;

  if (!preference) {
    return profile.location
      ? job.location.toLowerCase().includes(profile.location.toLowerCase())
      : true;
  }

  if (preference.scope === "country") return true;

  if (preference.scope === "state" && preference.state) {
    return job.location.toUpperCase().includes(preference.state.toUpperCase());
  }

  if (preference.scope === "city" && preference.city) {
    return job.location.toLowerCase().includes(preference.city.toLowerCase());
  }

  return preference.acceptsRelocation;
};

const isSalaryCompatible = (profile: RecommendationProfile, job: Job): boolean => {
  const expectation = profile.salaryExpectation;
  if (!expectation || job.salaryMin === null || job.salaryMax === null) return true;

  return job.salaryMax >= expectation.min && job.salaryMin <= expectation.max;
};

const isSeniorityCompatible = (profile: RecommendationProfile, job: Job): boolean => {
  if (!profile.seniority) return true;

  const profileRank = SENIORITY_RANK[profile.seniority];
  const jobRank = SENIORITY_RANK[job.seniority];
  const distance = Math.abs(profileRank - jobRank);

  return distance <= 1;
};

const getMatchLabel = (score: number): MatchScore["label"] => {
  if (score >= 90) return "excellent";
  if (score >= 75) return "good";
  if (score >= 60) return "fair";
  return "low";
};

const buildMissingSkills = (profile: RecommendationProfile, job: Job): MatchScore["missingSkills"] => {
  const profileSkills = new Set(profile.skillNames.map(normalize));
  const jobTechs = job.technologies.map((tech) => tech.name);

  const missing = jobTechs.filter((name) => !profileSkills.has(normalize(name)));

  const prioritized = [
    ...missing.filter((name) => COMMON_MISSING_PRIORITY.includes(name)),
    ...missing.filter((name) => !COMMON_MISSING_PRIORITY.includes(name)),
  ].slice(0, 4);

  return prioritized.map((name, index) => ({
    id: `missing_${index + 1}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, "-").replace(/\./g, ""),
  }));
};

export const computeMatchScore = (job: Job, profile: RecommendationProfile): MatchScore => {
  const weights = MATCH_WEIGHTS;
  let score = weights.baseScore;
  const reasons: MatchScore["reasons"] = [];

  const matchedSkills = findMatchingSkills(profile, job);
  matchedSkills.forEach((skill, index) => {
    score += weights.skillMatch;
    reasons.push({
      id: `reason_skill_${index}`,
      label: `${skill} encontrado`,
      matched: true,
    });
  });

  const modalityMatch = isModalityCompatible(profile, job);
  if (modalityMatch && profile.modality) {
    score += weights.modalityMatch;
    reasons.push({
      id: "reason_modality",
      label: profile.modality === "any" ? "Aceita qualquer modalidade" : "Modalidade compatível",
      matched: true,
    });
  } else if (profile.modality) {
    reasons.push({
      id: "reason_modality",
      label: "Modalidade incompatível",
      matched: false,
    });
  }

  if (isLocationCompatible(profile, job)) {
    score += weights.locationMatch;
    reasons.push({
      id: "reason_location",
      label: "Localização compatível",
      matched: true,
    });
  }

  if (isSalaryCompatible(profile, job)) {
    score += weights.salaryMatch;
    reasons.push({
      id: "reason_salary",
      label: "Pretensão compatível",
      matched: true,
    });
  }

  const blockedInJob = findBlockedSkillsInJob(profile, job);
  if (blockedInJob.length > 0) {
    score += weights.blockedSkillPenalty * blockedInJob.length;
    blockedInJob.forEach((skill, index) => {
      reasons.push({
        id: `reason_blocked_${index}`,
        label: `${skill} bloqueado`,
        matched: false,
      });
    });
  }

  if (!isSeniorityCompatible(profile, job) && profile.seniority) {
    score += weights.seniorityMismatchPenalty;
    reasons.push({
      id: "reason_seniority",
      label: "Senioridade incompatível",
      matched: false,
    });
  }

  const finalScore = Math.max(0, Math.min(100, score));

  return {
    score: finalScore,
    label: getMatchLabel(finalScore),
    reasons,
    missingSkills: buildMissingSkills(profile, job),
  };
};

export { getMatchLabel };
