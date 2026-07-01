import { http, HttpResponse } from "msw";

import type { ApiResponse, CursorPaginatedResponse, Job } from "@/types";

import { createApplication } from "../factories/create-application";
import { getFixtureStore } from "../fixtures";
import { enrichJobWithEngagement } from "../utils/job-engagement";
import { filterJobs, getJobSortValue, parseJobListParams } from "../utils/job-filters";
import { paginateWithCursor } from "../utils/pagination";
import { getScoredJob, getScoredJobs } from "../utils/smart-mock-context";

const enrichJobs = (jobs: Job[]) => {
  const store = getFixtureStore();
  return jobs.map((job) => enrichJobWithEngagement(getScoredJob(job), store));
};

const getEnrichedJobById = (id: string): Job | null => {
  const store = getFixtureStore();
  const job = store.jobs.find((item) => item.id === id);
  if (!job) return null;
  return enrichJobWithEngagement(getScoredJob(job), store);
};

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

  http.get("*/jobs/:id", ({ params }) => {
    const job = getEnrichedJobById(String(params.id));

    if (!job) {
      return HttpResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return HttpResponse.json<ApiResponse<Job>>({ data: job });
  }),

  http.patch("*/jobs/:id/favorite", async ({ params, request }) => {
    const store = getFixtureStore();
    const jobId = String(params.id);
    const job = store.jobs.find((item) => item.id === jobId);

    if (!job) {
      return HttpResponse.json({ message: "Job not found" }, { status: 404 });
    }

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

  http.post("*/jobs/:id/apply", ({ params }) => {
    const store = getFixtureStore();
    const jobId = String(params.id);
    const job = store.jobs.find((item) => item.id === jobId);

    if (!job) {
      return HttpResponse.json({ message: "Job not found" }, { status: 404 });
    }

    const existing = store.applications.find((app) => app.jobId === jobId);
    if (existing) {
      const enriched = getEnrichedJobById(jobId);
      return HttpResponse.json<ApiResponse<Job>>({ data: enriched!, message: "Already applied" });
    }

    const application = createApplication({
      index: store.applications.length + 1,
      userId: store.user.id,
      job: getScoredJob(job),
      stage: "applied",
    });

    store.applications.push(application);
    store.favoriteJobIds.add(jobId);

    const enriched = getEnrichedJobById(jobId);
    return HttpResponse.json<ApiResponse<Job>>({ data: enriched!, message: "Application created" });
  }),

  http.delete("*/jobs/:id/apply", ({ params }) => {
    const store = getFixtureStore();
    const jobId = String(params.id);
    const index = store.applications.findIndex((app) => app.jobId === jobId);

    if (index === -1) {
      return HttpResponse.json({ message: "Application not found" }, { status: 404 });
    }

    store.applications.splice(index, 1);

    const enriched = getEnrichedJobById(jobId);
    return HttpResponse.json<ApiResponse<Job>>({ data: enriched!, message: "Application removed" });
  }),

  http.post("*/jobs/:id/view", ({ params }) => {
    const store = getFixtureStore();
    const jobId = String(params.id);
    const job = store.jobs.find((item) => item.id === jobId);

    if (!job) {
      return HttpResponse.json({ message: "Job not found" }, { status: 404 });
    }

    store.viewedJobIds.add(jobId);

    const enriched = getEnrichedJobById(jobId);
    return HttpResponse.json<ApiResponse<Job>>({ data: enriched!, message: "Job marked as viewed" });
  }),
];
