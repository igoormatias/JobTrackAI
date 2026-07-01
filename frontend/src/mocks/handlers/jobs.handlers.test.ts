import { describe, expect, it } from "vitest";

import { createUserProfile } from "@/mocks/fixtures/profile-store";
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

  it("sorts jobs by match score by default", async () => {
    createUserProfile("user_0001", {
      area: "frontend",
      seniority: "senior",
      modality: "remote",
      skillNames: ["React", "TypeScript"],
      blockedSkills: [],
      onboardingCompleted: true,
    });

    const { data } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 20 },
    });

    const scores = data.data.map((job) => job.matchScore.score);
    const sorted = [...scores].sort((a, b) => b - a);

    expect(scores).toEqual(sorted);
    expect(data.data[0]?.matchScore.reasons.length).toBeGreaterThan(0);
  });

  it("sorts jobs by company", async () => {
    const { data } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { sortBy: "company", sortDirection: "asc", limit: 10 },
    });

    const names = data.data.map((job) => job.company.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  it("favorites and applies to jobs", async () => {
    const { data: list } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 1 },
    });
    const jobId = list.data[0]!.id;

    const { data: favorited } = await apiClient.patch<{ data: Job }>(`/jobs/${jobId}/favorite`, {
      isFavorite: true,
    });
    expect(favorited.data.isFavorite).toBe(true);

    const { data: applied } = await apiClient.post<{ data: Job }>(`/jobs/${jobId}/apply`);
    expect(applied.data.engagementState).toBe("applied");

    const { data: removed } = await apiClient.delete<{ data: Job }>(`/jobs/${jobId}/apply`);
    expect(removed.data.engagementState).not.toBe("applied");
  });
});
