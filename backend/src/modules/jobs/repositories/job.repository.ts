import type { Job, JobEngagementState, JobListParams } from "../types/job.types.js";

const createMatchScore = (score: number) => ({
  score,
  label: score >= 85 ? "excellent" : score >= 70 ? "good" : score >= 55 ? "fair" : "low",
  reasons: [
    { id: "reason_stack", label: "Stack compatível", matched: true },
    { id: "reason_modality", label: "Modalidade alinhada", matched: true },
  ],
  missingSkills: [],
} as Job["matchScore"]);

const createJob = (index: number): Job => {
  const companyId = `company_${String((index % 10) + 1).padStart(4, "0")}`;
  const id = `job_${String(index).padStart(4, "0")}`;
  const now = new Date().toISOString();

  return {
    id,
    title: `Software Engineer ${index}`,
    slug: `software-engineer-${index}`,
    companyId,
    company: {
      id: companyId,
      name: `Company ${(index % 10) + 1}`,
      slug: `company-${(index % 10) + 1}`,
      logoUrl: null,
    },
    area: "frontend",
    seniority: "senior",
    modality: "remote",
    location: "São Paulo, SP",
    salaryMin: 12000,
    salaryMax: 18000,
    currency: "BRL",
    description: "Vaga mock para desenvolvimento do módulo Jobs.",
    requirements: ["React", "TypeScript", "Trabalho em equipe"],
    benefits: ["Plano de saúde", "Home office"],
    technologies: [
      { id: `tech_${index}_1`, name: "React", slug: "react" },
      { id: `tech_${index}_2`, name: "TypeScript", slug: "typescript" },
    ],
    source: "gupy",
    sourceUrl: `https://gupy.com.br/vagas/${index}`,
    status: "active",
    isFavorite: index <= 3,
    engagementState: index <= 3 ? "favorited" : "new",
    matchScore: createMatchScore(95 - (index % 20)),
    publishedAt: now,
    createdAt: now,
    updatedAt: now,
  };
};

export class JobRepository {
  private jobs: Job[] = Array.from({ length: 50 }, (_, index) => createJob(index + 1));
  private favoriteJobIds = new Set(this.jobs.filter((job) => job.isFavorite).map((job) => job.id));
  private viewedJobIds = new Set<string>();
  private appliedJobIds = new Set<string>();
  private rejectedJobIds = new Set<string>();

  findAll(): Job[] {
    return this.jobs.map((job) => this.enrich(job));
  }

  findById(id: string): Job | null {
    const job = this.jobs.find((item) => item.id === id);
    return job ? this.enrich(job) : null;
  }

  setFavorite(id: string, isFavorite: boolean): Job | null {
    const job = this.jobs.find((item) => item.id === id);
    if (!job) return null;

    if (isFavorite) {
      this.favoriteJobIds.add(id);
    } else {
      this.favoriteJobIds.delete(id);
    }

    return this.enrich(job);
  }

  markViewed(id: string): Job | null {
    const job = this.jobs.find((item) => item.id === id);
    if (!job) return null;
    this.viewedJobIds.add(id);
    return this.enrich(job);
  }

  apply(id: string): Job | null {
    const job = this.jobs.find((item) => item.id === id);
    if (!job) return null;
    this.appliedJobIds.add(id);
    this.favoriteJobIds.add(id);
    return this.enrich(job);
  }

  removeApplication(id: string): Job | null {
    const job = this.jobs.find((item) => item.id === id);
    if (!job) return null;
    this.appliedJobIds.delete(id);
    this.rejectedJobIds.delete(id);
    return this.enrich(job);
  }

  private resolveEngagementState(id: string): JobEngagementState {
    if (this.rejectedJobIds.has(id)) return "rejected";
    if (this.appliedJobIds.has(id)) return "applied";
    if (this.favoriteJobIds.has(id)) return "favorited";
    if (this.viewedJobIds.has(id)) return "viewed";
    return "new";
  }

  private enrich(job: Job): Job {
    const isFavorite = this.favoriteJobIds.has(job.id);
    return {
      ...job,
      isFavorite,
      engagementState: this.resolveEngagementState(job.id),
    };
  }

  reset(): void {
    this.jobs = Array.from({ length: 50 }, (_, index) => createJob(index + 1));
    this.favoriteJobIds = new Set(this.jobs.filter((job) => job.isFavorite).map((job) => job.id));
    this.viewedJobIds = new Set();
    this.appliedJobIds = new Set();
    this.rejectedJobIds = new Set();
  }
}

export const jobRepository = new JobRepository();

export type { JobListParams };
