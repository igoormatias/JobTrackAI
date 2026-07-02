import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import { MATCH_ENGINE_VERSION } from "../../../shared/domain/match-weights.js";
import {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGES,
} from "../../pipeline/constants/pipeline-stages.js";
import { trackingService } from "../../tracking/application/tracking.service.js";
import { jobRepository, type JobRepository } from "../repositories/job.repository.js";
import type { JobInsight, JobMatchDto, JobTimelineStep, LearningGap } from "../types/job-details.types.js";
import type { Job } from "../types/job.types.js";
import { JobService } from "./job.service.js";

const MATCH_LABEL_PT: Record<Job["matchScore"]["label"], string> = {
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

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export class JobDetailsService {
  constructor(
    private readonly jobs: JobService = new JobService(),
    private readonly repository: JobRepository = jobRepository,
  ) {}

  async getJobMatch(userId: string, id: string): Promise<JobMatchDto> {
    const job = await this.jobs.getJobById(userId, id);
    return {
      matchScore: job.matchScore,
      compatibilityLabel: MATCH_LABEL_PT[job.matchScore.label],
      engineVersion: MATCH_ENGINE_VERSION,
    };
  }

  async getRelatedJobs(userId: string, id: string): Promise<Job[]> {
    const current = await this.jobs.getJobById(userId, id);
    const list = await this.jobs.listJobs(userId, { limit: 100 });
    return list.data
      .filter((job) => job.id !== id)
      .filter(
        (job) =>
          job.area === current.area ||
          job.technologies.some((tech) =>
            current.technologies.some((currentTech) => currentTech.slug === tech.slug),
          ),
      )
      .sort((a, b) => b.matchScore.score - a.matchScore.score)
      .slice(0, 5);
  }

  async getJobTimeline(userId: string, jobId: string): Promise<JobTimelineStep[]> {
    const tracking = await trackingService.findByJobId(userId, jobId);
    if (!tracking) return [];

    const currentIndex = PIPELINE_STAGES.indexOf(tracking.stage);

    return PIPELINE_STAGES.map((stage, index) => {
      const timelineEvent = tracking.timeline.find((event) =>
        event.metadata && typeof event.metadata === "object" && "to" in event.metadata
          ? event.metadata.to === stage
          : false,
      );

      let status: JobTimelineStep["status"] = "upcoming";
      if (index < currentIndex) status = "completed";
      if (index === currentIndex) status = "current";

      return {
        stage,
        label: PIPELINE_STAGE_LABELS[stage],
        status,
        occurredAt: timelineEvent?.occurredAt ?? (status === "current" ? tracking.updatedAt : undefined),
      };
    });
  }

  async getJobInsights(userId: string, id: string): Promise<JobInsight[]> {
    const job = await this.jobs.getJobById(userId, id);
    const match = await this.getJobMatch(userId, id);
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
        description: `Foque em ${match.matchScore.missingSkills
          .slice(0, 2)
          .map((skill) => skill.name)
          .join(" e ")} para aumentar seu match.`,
        variant: "warning",
      });
    }

    return insights;
  }

  async getLearningGaps(userId: string, id: string): Promise<LearningGap[]> {
    const job = await this.jobs.getJobById(userId, id);
    return job.matchScore.missingSkills.map((skill, index) => ({
      id: skill.id,
      name: skill.name,
      slug: slugify(skill.name),
      importance: HIGH_PRIORITY_SKILLS.includes(skill.name) ? "high" : index < 2 ? "medium" : "low",
      category: categorizeSkill(skill.name),
    }));
  }

  assertJobExists(id: string): void {
    const job = this.repository.findById(id);
    if (!job) {
      throw new NotFoundError("Job not found");
    }
  }
}

export const jobDetailsService = new JobDetailsService();
