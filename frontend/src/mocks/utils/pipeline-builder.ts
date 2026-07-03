import type {
  Application,
  PipelineColumn,
  PipelineData,
  PipelineKpis,
  PipelineListParams,
  PipelineStage,
} from "@/types";

import { PIPELINE_INTERVIEW_STAGES, PIPELINE_STAGE_LABELS, PIPELINE_STAGES } from "../constants/mock-data";
import { getFixtureStore } from "../fixtures";
import { enrichApplicationJob } from "./smart-mock-context";

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
  const interviews = applications.filter((app) =>
    PIPELINE_INTERVIEW_STAGES.includes(app.stage as (typeof PIPELINE_INTERVIEW_STAGES)[number]),
  ).length;
  const offers = applications.filter((app) => app.stage === "offer" || app.stage === "hired").length;
  const rejections = applications.filter((app) => app.stage === "closed").length;
  const hired = applications.filter((app) => app.stage === "hired").length;
  const applied = applications.filter((app) => app.stage !== "discovery").length;

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

export const buildPipelineData = (params: PipelineListParams = {}): PipelineData => {
  const store = getFixtureStore();
  const all = store.applications
    .filter((app) => app.status === "active")
    .map((app) => enrichApplicationJob(app, store.jobs));

  const filtered = filterApplications(all, params);

  return {
    columns: buildColumns(filtered),
    totalApplications: filtered.length,
    kpis: buildKpis(filtered),
  };
};

export const findApplicationById = (id: string): Application | null => {
  const store = getFixtureStore();
  const app = store.applications.find((item) => item.id === id);
  return app ? enrichApplicationJob(app, store.jobs) : null;
};

export const moveApplicationStage = (id: string, stage: PipelineStage): Application | null => {
  const store = getFixtureStore();
  const index = store.applications.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = store.applications[index]!;
  const previousStage = current.stage;

  if (stage === previousStage) {
    return enrichApplicationJob(current, store.jobs);
  }

  const updated: Application = {
    ...current,
    stage,
    updatedAt: new Date().toISOString(),
    lastStageUpdatedAt: new Date().toISOString(),
    timeline: [
      ...current.timeline,
      {
        id: `timeline_${id}_${current.timeline.length + 1}`,
        applicationId: id,
        type: "stage_changed",
        title: `Avançou para ${PIPELINE_STAGE_LABELS[stage]}`,
        description: null,
        occurredAt: new Date().toISOString(),
        metadata: { from: previousStage, to: stage },
      },
    ],
  };

  store.applications[index] = updated;
  return enrichApplicationJob(updated, store.jobs);
};

export const toggleApplicationFavorite = (id: string): Application | null => {
  const store = getFixtureStore();
  const index = store.applications.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const current = store.applications[index]!;
  const isFavorite = !current.job.isFavorite;

  if (isFavorite) {
    store.favoriteJobIds.add(current.jobId);
  } else {
    store.favoriteJobIds.delete(current.jobId);
  }

  const updated: Application = {
    ...current,
    job: { ...enrichApplicationJob(current, store.jobs).job, isFavorite },
  };

  store.applications[index] = updated;
  return enrichApplicationJob(updated, store.jobs);
};

export const archiveApplication = (id: string): Application | null => {
  const store = getFixtureStore();
  const index = store.applications.findIndex((item) => item.id === id);
  if (index === -1) return null;

  store.applications[index] = {
    ...store.applications[index]!,
    status: "archived",
    updatedAt: new Date().toISOString(),
  };

  return enrichApplicationJob(store.applications[index]!, store.jobs);
};

export const deleteApplicationById = (id: string): boolean => {
  const store = getFixtureStore();
  const index = store.applications.findIndex((item) => item.id === id);
  if (index === -1) return false;
  store.applications.splice(index, 1);
  return true;
};
