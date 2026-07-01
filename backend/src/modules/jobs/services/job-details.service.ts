import { NotFoundError } from "../../../shared/errors/not-found-error.js";
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

const PIPELINE_STAGES = ["applied", "screening", "interview", "offer", "hired"] as const;
const PIPELINE_STAGE_LABELS: Record<(typeof PIPELINE_STAGES)[number], string> = {
  applied: "Candidatura enviada",
  screening: "Triagem",
  interview: "Entrevista",
  offer: "Proposta",
  hired: "Contratado",
};

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

  getJobMatch(id: string): JobMatchDto {
    const job = this.jobs.getJobById(id);
    return {
      matchScore: job.matchScore,
      compatibilityLabel: MATCH_LABEL_PT[job.matchScore.label],
    };
  }

  getRelatedJobs(id: string): Job[] {
    const current = this.jobs.getJobById(id);
    return this.repository
      .findAll()
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

  getJobTimeline(id: string): JobTimelineStep[] {
    const job = this.jobs.getJobById(id);
    if (job.engagementState !== "applied") return [];

    const currentIndex = 0;

    return PIPELINE_STAGES.map((stage, index) => {
      let status: JobTimelineStep["status"] = "upcoming";
      if (index < currentIndex) status = "completed";
      if (index === currentIndex) status = "current";

      return {
        stage,
        label: PIPELINE_STAGE_LABELS[stage],
        status,
        occurredAt: status === "current" ? job.updatedAt : undefined,
      };
    });
  }

  getJobInsights(id: string): JobInsight[] {
    const job = this.jobs.getJobById(id);
    const match = this.getJobMatch(id);
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

  getLearningGaps(id: string): LearningGap[] {
    const job = this.jobs.getJobById(id);
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
