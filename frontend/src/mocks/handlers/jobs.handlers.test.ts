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

  it("favorites a job", async () => {
    const { data: list } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 1 },
    });
    const jobId = list.data[0]!.id;

    const { data: favorited } = await apiClient.patch<{ data: Job }>(`/jobs/${jobId}/favorite`, {
      isFavorite: true,
    });
    expect(favorited.data.isFavorite).toBe(true);
  });

  it("returns job match details", async () => {
    const { data: list } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 1 },
    });
    const jobId = list.data[0]!.id;

    const { data } = await apiClient.get<{ data: { matchScore: { score: number }; compatibilityLabel: string } }>(
      `/jobs/${jobId}/match`,
    );

    expect(data.data.matchScore.score).toBeGreaterThan(0);
    expect(data.data.compatibilityLabel).toBeTruthy();
  });

  it("returns related jobs", async () => {
    const { data: list } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 1 },
    });
    const jobId = list.data[0]!.id;

    const { data } = await apiClient.get<{ data: Job[] }>(`/jobs/${jobId}/related`);

    expect(data.data.length).toBeGreaterThan(0);
    expect(data.data.length).toBeLessThanOrEqual(5);
    expect(data.data.every((job) => job.id !== jobId)).toBe(true);
  });

  it("returns job timeline", async () => {
    const { data: list } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 1 },
    });
    const jobId = list.data[0]!.id;

    await apiClient.post("/tracking", {
      jobId,
      stage: "applied",
      stageOccurredAt: new Date().toISOString(),
    });

    const { data } = await apiClient.get<{ data: { stage: string; status: string }[] }>(
      `/jobs/${jobId}/timeline`,
    );

    expect(Array.isArray(data.data)).toBe(true);
    if (data.data.length > 0) {
      expect(data.data.some((step) => step.status === "current")).toBe(true);
    }
  });

  it("returns job insights", async () => {
    const { data: list } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 1 },
    });
    const jobId = list.data[0]!.id;

    const { data } = await apiClient.get<{ data: { id: string; title: string }[] }>(
      `/jobs/${jobId}/insights`,
    );

    expect(data.data.length).toBeGreaterThan(0);
  });

  it("returns learning gaps", async () => {
    const { data: list } = await apiClient.get<CursorPaginatedResponse<Job>>("/jobs", {
      params: { limit: 1 },
    });
    const jobId = list.data[0]!.id;

    const { data } = await apiClient.get<{ data: { id: string; name: string; importance: string }[] }>(
      `/jobs/${jobId}/learning-gaps`,
    );

    expect(Array.isArray(data.data)).toBe(true);
  });
});
