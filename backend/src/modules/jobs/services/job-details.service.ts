import { MATCH_ENGINE_VERSION } from "../../../shared/domain/match-weights.js";
import {
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGES,
} from "../../pipeline/constants/pipeline-stages.js";
import { trackingService } from "../../tracking/application/tracking.service.js";
import type { JobInsight, JobMatchDto, JobTimelineStep, LearningGap } from "../types/job-details.types.js";
import type { Job } from "../types/job.types.js";
import { JobService } from "./job.service.js";

const MATCH_LABEL_PT: Record<Job["matchScore"]["label"], string> = {
  excellent: "Excelente Match",
  good: "Bom Match",
  fair: "Match Razoável",
  low: "Match Baixo",
};

const CONFIDENCE_LABEL_PT: Record<"high" | "medium" | "low", string> = {
  high: "Alta",
  medium: "Média",
  low: "Baixa",
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
  constructor(private readonly jobs: JobService = new JobService()) {}

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
    return this.jobs.findRelatedJobs(userId, current);
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
    const matchScore = match.matchScore;
    const coverage = matchScore.skillCoverage;
    const foundSkills = (matchScore.skillEvidence ?? [])
      .filter((item) => item.present)
      .map((item) => item.name);
    const missingSkills = matchScore.missingSkills.map((skill) => skill.name);
    const confidence = matchScore.confidence;

    if (matchScore.score >= 90) {
      insights.push({
        id: "insight_high_match",
        title: "Alta compatibilidade",
        description: "Seu perfil possui alta compatibilidade com esta vaga.",
        variant: "positive",
      });
    }

    if (coverage && coverage.required > 0) {
      insights.push({
        id: "insight_requirements",
        title: "Cobertura de skills",
        description: `${coverage.matched} de ${coverage.required} skills encontradas (${coverage.percent}%).`,
        variant: coverage.percent >= 70 ? "positive" : "neutral",
      });
    } else {
      insights.push({
        id: "insight_requirements",
        title: "Requisitos atendidos",
        description: `Match atual de ${matchScore.score}% com base nos fatores conhecidos.`,
        variant: matchScore.score >= 70 ? "positive" : "neutral",
      });
    }

    if (foundSkills.length > 0) {
      insights.push({
        id: "insight_found_skills",
        title: "Skills encontradas",
        description: foundSkills.slice(0, 6).join(", "),
        variant: "positive",
      });
    }

    if (missingSkills.length > 0) {
      insights.push({
        id: "insight_gaps",
        title: "Skills faltantes",
        description: `Foque em ${missingSkills.slice(0, 3).join(" e ")} para aumentar seu match.`,
        variant: "warning",
      });
    }

    const applicableFactors = (matchScore.factors ?? []).filter((factor) => factor.applicable);
    if (applicableFactors.length > 0) {
      insights.push({
        id: "insight_weights",
        title: "Pesos considerados",
        description: applicableFactors
          .map((factor) => `${factor.label} ${factor.weight}%`)
          .join(" · "),
        variant: "neutral",
      });
    }

    if (confidence) {
      insights.push({
        id: "insight_confidence",
        title: `Confiança ${CONFIDENCE_LABEL_PT[confidence.level]}`,
        description: confidence.signals.slice(0, 3).join(" · ") || `Score de confiança ${confidence.score}%.`,
        variant: confidence.level === "low" ? "warning" : "neutral",
      });
    }

    insights.push({
      id: "insight_engine",
      title: "Engine utilizada",
      description: `${match.engineVersion ?? MATCH_ENGINE_VERSION} · atualizado em ${new Date(job.updatedAt).toLocaleDateString("pt-BR")}`,
      variant: "neutral",
    });

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
}

export const jobDetailsService = new JobDetailsService();
