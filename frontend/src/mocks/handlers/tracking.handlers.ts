import { http, HttpResponse } from "msw";

import type { Application, Job, PipelineStage } from "@/types";

import { getFixtureStore } from "../fixtures";
import { createApplication } from "../factories/create-application";
import { createJob } from "../factories/create-job";
import {
  findApplicationById,
  moveApplicationStage,
  toggleApplicationFavorite,
} from "../utils/pipeline-builder";
import { enrichApplicationJob } from "../utils/smart-mock-context";

type CreateTrackingBody =
  | {
      jobId: string;
      stage: PipelineStage;
      stageOccurredAt: string;
      notes?: string | null;
    }
  | {
      job: {
        companyName: string;
        title: string;
        sourceUrl?: string | null;
        description?: string | null;
        source: string;
      };
      stage: PipelineStage;
      stageOccurredAt: string;
      notes?: string | null;
    };

const toTrackingResponse = (application: Application) => ({
  ...application,
  isFavorite: application.job.isFavorite,
  priority: "MEDIUM" as const,
  visibility: "VISIBLE" as const,
});

export const trackingHandlers = [
  http.get("*/tracking", () => {
    const store = getFixtureStore();
    const data = store.applications
      .filter((app) => app.status === "active")
      .map((app) => toTrackingResponse(enrichApplicationJob(app, store.jobs)));
    return HttpResponse.json({ data });
  }),

  http.post("*/tracking", async ({ request }) => {
    const store = getFixtureStore();
    const body = (await request.json()) as CreateTrackingBody;

    if ("jobId" in body) {
      const exists = store.applications.some((app) => app.jobId === body.jobId);
      if (exists) {
        return HttpResponse.json({ message: "Job already tracked" }, { status: 409 });
      }

      const job = store.jobs.find((item) => item.id === body.jobId);
      if (!job) return HttpResponse.json({ message: "Job not found" }, { status: 404 });

      const application = createApplication({
        index: store.applications.length + 1,
        userId: "user_0001",
        job,
        stage: body.stage,
      });
      application.notes = body.notes ?? null;
      application.lastStageUpdatedAt = body.stageOccurredAt;
      store.applications.push(application);
      return HttpResponse.json({ data: toTrackingResponse(enrichApplicationJob(application, store.jobs)) }, { status: 201 });
    }

    const manualJob = createJob({
      index: store.jobs.length + 1,
      company: {
        id: `manual_${store.jobs.length}`,
        name: body.job.companyName,
        slug: "manual",
        logoUrl: null,
        website: null,
        industry: "Manual",
        size: "small",
        location: "Brasil",
        jobCount: 0,
      },
      title: body.job.title,
      source: body.job.source as Job["source"],
      sourceUrl: body.job.sourceUrl ?? "",
      description: body.job.description ?? "",
    });
    store.jobs.push(manualJob);

    const application = createApplication({
      index: store.applications.length + 1,
      userId: "user_0001",
      job: manualJob,
      stage: body.stage,
    });
    application.notes = body.notes ?? null;
    application.lastStageUpdatedAt = body.stageOccurredAt;
    store.applications.push(application);

    return HttpResponse.json({ data: toTrackingResponse(enrichApplicationJob(application, store.jobs)) }, { status: 201 });
  }),

  http.patch("*/tracking/:id/stage", async ({ params, request }) => {
    const body = (await request.json()) as { stage: PipelineStage; occurredAt: string };
    const updated = moveApplicationStage(String(params.id), body.stage);
    if (!updated) return HttpResponse.json({ message: "Tracking not found" }, { status: 404 });
    return HttpResponse.json({ data: toTrackingResponse(updated) });
  }),

  http.patch("*/tracking/:id/favorite", ({ params }) => {
    const updated = toggleApplicationFavorite(String(params.id));
    if (!updated) return HttpResponse.json({ message: "Tracking not found" }, { status: 404 });
    return HttpResponse.json({ data: toTrackingResponse(updated) });
  }),

  http.patch("*/tracking/:id/priority", async ({ params }) => {
    const application = findApplicationById(String(params.id));
    if (!application) return HttpResponse.json({ message: "Tracking not found" }, { status: 404 });
    return HttpResponse.json({ data: toTrackingResponse(application) });
  }),

  http.patch("*/tracking/:id/visibility", async ({ params }) => {
    const application = findApplicationById(String(params.id));
    if (!application) return HttpResponse.json({ message: "Tracking not found" }, { status: 404 });
    return HttpResponse.json({ data: toTrackingResponse(application) });
  }),

  http.patch("*/tracking/:id/notes", async ({ params, request }) => {
    const store = getFixtureStore();
    const body = (await request.json()) as { notes: string | null };
    const index = store.applications.findIndex((item) => item.id === String(params.id));
    if (index === -1) return HttpResponse.json({ message: "Tracking not found" }, { status: 404 });
    store.applications[index] = { ...store.applications[index]!, notes: body.notes };
    return HttpResponse.json({ data: toTrackingResponse(enrichApplicationJob(store.applications[index]!, store.jobs)) });
  }),

  http.get("*/tracking/:id/timeline", ({ params }) => {
    const application = findApplicationById(String(params.id));
    if (!application) return HttpResponse.json({ message: "Tracking not found" }, { status: 404 });
    return HttpResponse.json({ data: application.timeline });
  }),
];
