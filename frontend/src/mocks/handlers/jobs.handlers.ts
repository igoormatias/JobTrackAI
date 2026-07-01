import { http, HttpResponse } from "msw";

import type { ApiResponse, CursorPaginatedResponse, Job } from "@/types";

import { getFixtureStore } from "../fixtures";
import { getScoredJob, getScoredJobs } from "../utils/smart-mock-context";
import { filterJobs, parseJobListParams } from "../utils/job-filters";
import { paginateWithCursor } from "../utils/pagination";

export const jobsHandlers = [
  http.get("*/jobs", ({ request }) => {
    const store = getFixtureStore();
    const params = parseJobListParams(new URL(request.url).searchParams);
    const scoredJobs = getScoredJobs(store.jobs);
    const filtered = filterJobs(scoredJobs, params);

    const response = paginateWithCursor(filtered, {
      cursor: params.cursor,
      limit: params.limit,
      getId: (job) => job.id,
      getSortValue: (job) => job.publishedAt,
    });

    return HttpResponse.json<CursorPaginatedResponse<Job>>(response);
  }),

  http.get("*/jobs/:id", ({ params }) => {
    const store = getFixtureStore();
    const job = store.jobs.find((item) => item.id === params.id);

    if (!job) {
      return HttpResponse.json({ message: "Job not found" }, { status: 404 });
    }

    return HttpResponse.json<ApiResponse<Job>>({ data: getScoredJob(job) });
  }),
];
