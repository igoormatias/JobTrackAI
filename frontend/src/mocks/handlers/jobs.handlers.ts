import { http, HttpResponse } from "msw";

import type {
  JobInsight,
  JobMatchDto,
  JobTimelineStep,
  LearningGap,
} from "@/features/job-details/types/job-details.types";
import type { ApiResponse, CursorPaginatedResponse, Job } from "@/types";

import { getFixtureStore } from "../fixtures";
import { enrichJobWithEngagement } from "../utils/job-engagement";
import {
  buildDescriptionSections,
  buildJobInsights,
  buildJobMatch,
  buildJobTimeline,
  buildLearningGaps,
  buildRelatedJobs,
  getEnrichedJobById,
} from "../utils/job-details-builder";
import { filterJobs, getJobSortValue, parseJobListParams } from "../utils/job-filters";
import { paginateWithCursor } from "../utils/pagination";
import { getScoredJob, getScoredJobs } from "../utils/smart-mock-context";

const enrichJobs = (jobs: Job[]) => {
  const store = getFixtureStore();
  return jobs.map((job) => enrichJobWithEngagement(getScoredJob(job), store));
};

const notFound = () => HttpResponse.json({ message: "Job not found" }, { status: 404 });

export const jobsHandlers = [
  http.get("*/jobs", ({ request }) => {
    const store = getFixtureStore();
    const params = parseJobListParams(new URL(request.url).searchParams);
    const scoredJobs = enrichJobs(getScoredJobs(store.jobs));
    const filtered = filterJobs(scoredJobs, params);
    const sortBy = params.sortBy ?? "match";

    const response = paginateWithCursor(filtered, {
      cursor: params.cursor,
      limit: params.limit,
      getId: (job) => job.id,
      getSortValue: (job) => getJobSortValue(job, sortBy),
    });

    return HttpResponse.json<CursorPaginatedResponse<Job>>(response);
  }),

  http.get("*/jobs/:id/match", ({ params }) => {
    const match = buildJobMatch(String(params.id));
    if (!match) return notFound();
    return HttpResponse.json<ApiResponse<JobMatchDto>>({ data: match });
  }),

  http.get("*/jobs/:id/related", ({ params }) => {
    const job = getEnrichedJobById(String(params.id));
    if (!job) return notFound();
    return HttpResponse.json<ApiResponse<Job[]>>({ data: buildRelatedJobs(job.id) });
  }),

  http.get("*/jobs/:id/timeline", ({ params }) => {
    const job = getEnrichedJobById(String(params.id));
    if (!job) return notFound();
    return HttpResponse.json<ApiResponse<JobTimelineStep[]>>({ data: buildJobTimeline(job.id) });
  }),

  http.get("*/jobs/:id/insights", ({ params }) => {
    const job = getEnrichedJobById(String(params.id));
    if (!job) return notFound();
    const match = buildJobMatch(job.id);
    if (!match) return notFound();
    return HttpResponse.json<ApiResponse<JobInsight[]>>({ data: buildJobInsights(job, match) });
  }),

  http.get("*/jobs/:id/learning-gaps", ({ params }) => {
    const job = getEnrichedJobById(String(params.id));
    if (!job) return notFound();
    return HttpResponse.json<ApiResponse<LearningGap[]>>({ data: buildLearningGaps(job) });
  }),

  http.get("*/jobs/:id", ({ params }) => {
    const job = getEnrichedJobById(String(params.id));
    if (!job) return notFound();
    return HttpResponse.json<ApiResponse<Job>>({ data: job });
  }),

  http.patch("*/jobs/:id/favorite", async ({ params, request }) => {
    const store = getFixtureStore();
    const jobId = String(params.id);
    const job = store.jobs.find((item) => item.id === jobId);
    if (!job) return notFound();

    const payload = (await request.json()) as { isFavorite?: boolean };
    const shouldFavorite = payload.isFavorite ?? !store.favoriteJobIds.has(jobId);

    if (shouldFavorite) {
      store.favoriteJobIds.add(jobId);
    } else {
      store.favoriteJobIds.delete(jobId);
    }

    const enriched = getEnrichedJobById(jobId);
    return HttpResponse.json<ApiResponse<Job>>({ data: enriched!, message: "Favorite updated" });
  }),

  http.post("*/jobs/:id/view", ({ params }) => {
    const store = getFixtureStore();
    const jobId = String(params.id);
    const job = store.jobs.find((item) => item.id === jobId);
    if (!job) return notFound();

    store.viewedJobIds.add(jobId);
    const enriched = getEnrichedJobById(jobId);
    return HttpResponse.json<ApiResponse<Job>>({ data: enriched!, message: "Job marked as viewed" });
  }),
];

export { buildDescriptionSections };
