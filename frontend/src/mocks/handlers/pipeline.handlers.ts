import { http, HttpResponse } from "msw";

import type { ApiResponse, Application, PipelineData, PipelineListParams, PipelineStage } from "@/types";

import {
  archiveApplication,
  buildPipelineData,
  deleteApplicationById,
  findApplicationById,
  moveApplicationStage,
  toggleApplicationFavorite,
} from "../utils/pipeline-builder";

const parsePipelineParams = (searchParams: URLSearchParams): PipelineListParams => ({
  q: searchParams.get("q") ?? undefined,
  companyId: searchParams.get("companyId") ?? undefined,
  stage: (searchParams.get("stage") as PipelineStage) ?? undefined,
  area: searchParams.get("area") ?? undefined,
  technology: searchParams.get("technology") ?? undefined,
  matchMin: searchParams.get("matchMin") ? Number(searchParams.get("matchMin")) : undefined,
  isFavorite:
    searchParams.get("isFavorite") === "true"
      ? true
      : searchParams.get("isFavorite") === "false"
        ? false
        : undefined,
  sortBy: (searchParams.get("sortBy") as PipelineListParams["sortBy"]) ?? undefined,
  sortDirection: (searchParams.get("sortDirection") as PipelineListParams["sortDirection"]) ?? undefined,
});

const notFound = () => HttpResponse.json({ message: "Application not found" }, { status: 404 });

export const pipelineHandlers = [
  http.get("*/pipeline", ({ request }) => {
    const params = parsePipelineParams(new URL(request.url).searchParams);
    const data = buildPipelineData(params);
    return HttpResponse.json<ApiResponse<PipelineData>>({ data });
  }),

  http.patch("*/pipeline/:id/status", async ({ params, request }) => {
    const payload = (await request.json()) as { stage: PipelineStage };
    const updated = moveApplicationStage(String(params.id), payload.stage);
    if (!updated) return notFound();
    return HttpResponse.json<ApiResponse<Application>>({ data: updated, message: "Status updated" });
  }),

  http.patch("*/pipeline/:id/favorite", ({ params }) => {
    const updated = toggleApplicationFavorite(String(params.id));
    if (!updated) return notFound();
    return HttpResponse.json<ApiResponse<Application>>({ data: updated, message: "Favorite updated" });
  }),

  http.patch("*/pipeline/:id/archive", ({ params }) => {
    const updated = archiveApplication(String(params.id));
    if (!updated) return notFound();
    return HttpResponse.json<ApiResponse<Application>>({ data: updated, message: "Application archived" });
  }),

  http.delete("*/pipeline/:id", ({ params }) => {
    const deleted = deleteApplicationById(String(params.id));
    if (!deleted) return notFound();
    return HttpResponse.json({ message: "Application deleted" });
  }),

  http.get("*/pipeline/:id/timeline", ({ params }) => {
    const application = findApplicationById(String(params.id));
    if (!application) return notFound();
    return HttpResponse.json<ApiResponse<Application["timeline"]>>({ data: application.timeline });
  }),
];
