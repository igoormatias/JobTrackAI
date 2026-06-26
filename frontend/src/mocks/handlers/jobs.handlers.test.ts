import { describe, expect, it } from "vitest";

import { apiClient } from "@/lib/api-client";
import type { CursorPaginatedResponse, Job } from "@/types";

describe("jobs handlers", () => {
  it("returns paginated jobs", async () => {
    const { data } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 10 },
    });

    expect(data.data).toHaveLength(10);
    expect(data.meta.total).toBe(150);
    expect(data.meta.hasMore).toBe(true);
  });

  it("filters jobs by search query", async () => {
    const { data } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { q: "React", limit: 50 },
    });

    expect(data.data.length).toBeGreaterThan(0);
    expect(
      data.data.every(
        (job) =>
          job.title.toLowerCase().includes("react") ||
          job.company.name.toLowerCase().includes("react") ||
          job.technologies.some((tech) => tech.name.toLowerCase().includes("react")),
      ),
    ).toBe(true);
  });

  it("returns job by id", async () => {
    const { data: list } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 1 },
    });
    const jobId = list.data[0]!.id;

    const { data } = await apiClient.get<{ data: Job }>(`/jobs/${jobId}`);

    expect(data.data.id).toBe(jobId);
  });
});
