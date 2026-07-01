import { NotFoundError } from "../../../shared/errors/not-found-error.js";
import {
  INTERVIEW_STAGES,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGES,
} from "../constants/pipeline-stages.js";
import { pipelineRepository, type PipelineRepository } from "../repositories/pipeline.repository.js";
import type {
  Application,
  PipelineColumn,
  PipelineData,
  PipelineKpis,
  PipelineListParams,
  TimelineEvent,
} from "../types/pipeline.types.js";
import type { PipelineStage } from "../constants/pipeline-stages.js";

const filterApplications = (applications: Application[], params: PipelineListParams): Application[] => {
  let result = [...applications];
  const query = params.q?.toLowerCase();

  if (query) {
    result = result.filter(
      (app) =>
        app.job.title.toLowerCase().includes(query) ||
        app.job.company.name.toLowerCase().includes(query) ||
        app.job.technologies.some((tech) => tech.name.toLowerCase().includes(query)),
    );
  }

  if (params.companyId) {
    result = result.filter((app) => app.companyId === params.companyId);
  }

  if (params.stage) {
    result = result.filter((app) => app.stage === params.stage);
  }

  if (params.area) {
    result = result.filter((app) => app.job.area === params.area);
  }

  if (params.technology) {
    const tech = params.technology.toLowerCase();
    result = result.filter((app) =>
      app.job.technologies.some((item) => item.slug === tech || item.name.toLowerCase() === tech),
    );
  }

  if (params.matchMin !== undefined) {
    result = result.filter((app) => app.job.matchScore.score >= params.matchMin!);
  }

  if (params.isFavorite !== undefined) {
    result = result.filter((app) => app.job.isFavorite === params.isFavorite);
  }

  const direction = params.sortDirection === "asc" ? 1 : -1;
  const sortBy = params.sortBy ?? "updated";

  result.sort((a, b) => {
    switch (sortBy) {
      case "match":
        return (a.job.matchScore.score - b.job.matchScore.score) * direction;
      case "company":
        return a.job.company.name.localeCompare(b.job.company.name) * direction;
      case "recent":
        return (new Date(a.appliedAt).getTime() - new Date(b.appliedAt).getTime()) * direction;
      case "updated":
      default:
        return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * direction;
    }
  });

  return result;
};

const buildKpis = (applications: Application[]): PipelineKpis => {
  const interviews = applications.filter((app) => INTERVIEW_STAGES.includes(app.stage)).length;
  const offers = applications.filter((app) => app.stage === "offer" || app.stage === "hired").length;
  const rejections = applications.filter((app) => app.stage === "rejected").length;
  const hired = applications.filter((app) => app.stage === "hired").length;
  const applied = applications.filter((app) => app.stage !== "favorite").length;

  return {
    totalApplications: applications.length,
    interviews,
    offers,
    rejections,
    conversionRate: applied > 0 ? Math.round((hired / applied) * 100) : 0,
    avgDaysPerStage: 4.2,
  };
};

const buildColumns = (applications: Application[]): PipelineColumn[] =>
  PIPELINE_STAGES.map((stage) => {
    const stageApps = applications.filter((app) => app.stage === stage);
    return {
      stage,
      label: PIPELINE_STAGE_LABELS[stage],
      count: stageApps.length,
      applications: stageApps,
    };
  });

export class PipelineService {
  constructor(private readonly repository: PipelineRepository = pipelineRepository) {}

  getPipeline(params: PipelineListParams = {}): PipelineData {
    const all = this.repository.findAll();
    const filtered = filterApplications(all, params);

    return {
      columns: buildColumns(filtered),
      totalApplications: filtered.length,
      kpis: buildKpis(filtered),
    };
  }

  moveApplication(id: string, stage: PipelineStage): Application {
    const updated = this.repository.updateStage(id, stage);
    if (!updated) {
      throw new NotFoundError("Application not found");
    }
    return updated;
  }

  favoriteApplication(id: string): Application {
    const updated = this.repository.toggleFavorite(id);
    if (!updated) {
      throw new NotFoundError("Application not found");
    }
    return updated;
  }

  archiveApplication(id: string): Application {
    const updated = this.repository.updateStatus(id, "archived");
    if (!updated) {
      throw new NotFoundError("Application not found");
    }
    return updated;
  }

  deleteApplication(id: string): void {
    const deleted = this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError("Application not found");
    }
  }

  getTimeline(id: string): TimelineEvent[] {
    const application = this.repository.findById(id);
    if (!application) {
      throw new NotFoundError("Application not found");
    }
    return application.timeline;
  }
}

export const pipelineService = new PipelineService();
