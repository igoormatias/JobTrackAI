import type {
  JobInsight,
  JobMatchDto,
  JobTimelineStep,
  LearningGap,
} from "@/features/job-details/types/job-details.types";
import { getMatchLabel } from "@/features/recommendations/utils/match-score";
import type { Job } from "@/types";
import type { PipelineStage } from "@/types/application";

import { PIPELINE_STAGE_LABELS, PIPELINE_STAGES } from "../constants/mock-data";
import { getFixtureStore } from "../fixtures";
import { buildDescriptionSections } from "@/features/job-details/utils/description-sections";
import { enrichJobWithEngagement } from "./job-engagement";
import { getScoredJob, getScoredJobs } from "./smart-mock-context";

const MATCH_LABEL_PT: Record<ReturnType<typeof getMatchLabel>, string> = {
  excellent: "Excelente Match",
  good: "Bom Match",
  fair: "Match Razoável",
  low: "Match Baixo",
};

const HIGH_PRIORITY_SKILLS = ["Docker", "AWS", "Kafka", "Kubernetes", "GraphQL", "Terraform"];

const categorizeSkill = (name: string): string => {
  const normalized = name.toLowerCase();
  if (["docker", "kubernetes", "aws", "terraform", "kafka"].some((item) => normalized.includes(item))) {
    return "Infraestrutura";
  }
  if (["react", "vue", "angular", "next", "typescript", "javascript", "tailwind"].some((item) => normalized.includes(item))) {
    return "Frontend";
  }
  if (["node", "java", "python", "go", "graphql"].some((item) => normalized.includes(item))) {
    return "Backend";
  }
  return "Outras";
};

export const getEnrichedJobById = (id: string): Job | null => {
  const store = getFixtureStore();
  const job = store.jobs.find((item) => item.id === id);
  if (!job) return null;
  return enrichJobWithEngagement(getScoredJob(job), store);
};

export const buildJobMatch = (jobId: string): JobMatchDto | null => {
  const job = getEnrichedJobById(jobId);
  if (!job) return null;

  return {
    matchScore: job.matchScore,
    compatibilityLabel: MATCH_LABEL_PT[job.matchScore.label],
  };
};

export const buildLearningGaps = (job: Job): LearningGap[] =>
  job.matchScore.missingSkills.map((skill, index) => ({
    id: skill.id,
    name: skill.name,
    slug: skill.slug,
    importance: HIGH_PRIORITY_SKILLS.includes(skill.name) ? "high" : index < 2 ? "medium" : "low",
    category: categorizeSkill(skill.name),
  }));

export const buildJobInsights = (job: Job, match: JobMatchDto): JobInsight[] => {
  const insights: JobInsight[] = [];
  const matchedReasons = match.matchScore.reasons.filter((reason) => reason.matched);
  const requirementsMetPercent = job.requirements.length
    ? Math.round((matchedReasons.length / Math.max(job.requirements.length, 1)) * 100)
    : match.matchScore.score;

  if (match.matchScore.score >= 90) {
    insights.push({
      id: "insight_high_match",
      title: "Alta compatibilidade",
      description: "Seu perfil possui alta compatibilidade com esta vaga.",
      variant: "positive",
    });
  }

  insights.push({
    id: "insight_requirements",
    title: "Requisitos atendidos",
    description: `Você já atende aproximadamente ${Math.min(requirementsMetPercent, 100)}% dos requisitos principais.`,
    variant: requirementsMetPercent >= 70 ? "positive" : "neutral",
  });

  if (match.matchScore.missingSkills.length > 0) {
    insights.push({
      id: "insight_gaps",
      title: "Pontos de evolução",
      description: `Foque em ${match.matchScore.missingSkills.slice(0, 2).map((s) => s.name).join(" e ")} para aumentar seu match.`,
      variant: "warning",
    });
  }

  return insights;
};

export const buildRelatedJobs = (jobId: string): Job[] => {
  const store = getFixtureStore();
  const current = store.jobs.find((job) => job.id === jobId);
  if (!current) return [];

  const scored = getScoredJobs(store.jobs)
    .filter((job) => job.id !== jobId)
    .filter(
      (job) =>
        job.area === current.area ||
        job.technologies.some((tech) => current.technologies.some((currentTech) => currentTech.slug === tech.slug)),
    )
    .sort((a, b) => b.matchScore.score - a.matchScore.score)
    .slice(0, 5);

  return scored.map((job) => enrichJobWithEngagement(job, store));
};

export const buildJobTimeline = (jobId: string): JobTimelineStep[] => {
  const store = getFixtureStore();
  const application = store.applications.find((app) => app.jobId === jobId);
  if (!application) return [];

  const currentIndex = PIPELINE_STAGES.indexOf(application.stage);

  return PIPELINE_STAGES.map((stage, index) => {
    const timelineEvent = (application.timeline ?? []).find((event) =>
      event.metadata && typeof event.metadata === "object" && "to" in event.metadata
        ? event.metadata.to === stage
        : false,
    );

    let status: JobTimelineStep["status"] = "upcoming";
    if (index < currentIndex) status = "completed";
    if (index === currentIndex) status = "current";

    return {
      stage: stage as PipelineStage,
      label: PIPELINE_STAGE_LABELS[stage],
      status,
      occurredAt: timelineEvent?.occurredAt ?? (status === "current" ? application.updatedAt : undefined),
    };
  });
};

export { buildDescriptionSections };

export const getJobCompanyDetails = (job: Job) => {
  const store = getFixtureStore();
  const company = store.companies.find((item) => item.id === job.companyId);
  if (!company) return null;

  return {
    id: company.id,
    name: company.name,
    slug: company.slug,
    logoUrl: company.logoUrl,
    website: company.website,
    industry: company.industry,
    jobCount: company.jobCount,
  };
};
