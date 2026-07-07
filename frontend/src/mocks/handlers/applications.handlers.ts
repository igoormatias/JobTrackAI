import { http, HttpResponse } from "msw";

import type {
  ApiResponse,
  Application,
  ApplicationListParams,
  CursorPaginatedResponse,
  PipelineStage,
  UpdateApplicationPayload,
} from "@/types";

import { createTimelineEvent } from "../factories/create-timeline-event";
import { PIPELINE_STAGE_LABELS } from "../constants/mock-data";
import { getFixtureStore } from "../fixtures";
import { enrichApplicationJob } from "../utils/smart-mock-context";
import { paginateWithCursor } from "../utils/pagination";

const parseApplicationListParams = (searchParams: URLSearchParams): ApplicationListParams => ({
  cursor: searchParams.get("cursor") ?? undefined,
  limit: Number(searchParams.get("limit") ?? 20) || 20,
  stage: (searchParams.get("stage") as PipelineStage) ?? undefined,
  companyId: searchParams.get("companyId") ?? undefined,
  q: searchParams.get("q") ?? undefined,
});

export const applicationsHandlers = [
  http.get("*/applications", ({ request }) => {
    const store = getFixtureStore();
    const params = parseApplicationListParams(new URL(request.url).searchParams);

    let applications = store.applications.map((app) => enrichApplicationJob(app, store.jobs));

    if (params.stage) {
      applications = applications.filter((app) => app.stage === params.stage);
    }

    if (params.companyId) {
      applications = applications.filter((app) => app.companyId === params.companyId);
    }

    if (params.q) {
      const query = params.q.toLowerCase();
      applications = applications.filter(
        (app) =>
          app.job.title.toLowerCase().includes(query) ||
          app.job.company.name.toLowerCase().includes(query),
      );
    }

    applications.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const response = paginateWithCursor(applications, {
      cursor: params.cursor,
      limit: params.limit,
      getId: (app) => app.id,
      getSortValue: (app) => app.updatedAt,
    });

    return HttpResponse.json<CursorPaginatedResponse<Application>>(response);
  }),

  http.patch("*/applications/:id", async ({ params, request }) => {
    const store = getFixtureStore();
    const payload = (await request.json()) as UpdateApplicationPayload;
    const index = store.applications.findIndex((app) => app.id === params.id);

    if (index === -1) {
      return HttpResponse.json({ message: "Application not found" }, { status: 404 });
    }

    const current = store.applications[index]!;
    const previousStage = current.stage;

    const updated: Application = {
      ...current,
      ...payload,
      job: enrichApplicationJob(current, store.jobs).job,
      updatedAt: new Date().toISOString(),
    };

    if (payload.stage && payload.stage !== previousStage) {
      updated.timeline = [
        ...(updated.timeline ?? []),
        createTimelineEvent({
          applicationId: updated.id,
          index: (updated.timeline ?? []).length + 1,
          type: "stage_changed",
          title: `Avançou para ${PIPELINE_STAGE_LABELS[payload.stage]}`,
          occurredAt: new Date().toISOString(),
          metadata: { from: previousStage, to: payload.stage },
        }),
      ];
    }

    store.applications[index] = updated;

    return HttpResponse.json<ApiResponse<Application>>({
      data: updated,
      message: "Application updated successfully",
    });
  }),
];
