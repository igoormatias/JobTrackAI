import { describe, expect, it } from "vitest";

import { JobRepository } from "../repositories/job.repository.js";
import { JobService } from "../services/job.service.js";

const userId = "user_0001";

describe("JobService", () => {
  it("lists jobs with pagination", async () => {
    const repository = new JobRepository();
    const service = new JobService(repository);

    const result = await service.listJobs(userId, { limit: 10 });

    expect(result.data).toHaveLength(10);
    expect(result.meta.total).toBe(50);
    expect(result.meta.hasMore).toBe(true);
  });

  it("filters jobs by search query", async () => {
    const repository = new JobRepository();
    const service = new JobService(repository);

    const result = await service.listJobs(userId, { q: "Software", limit: 50 });

    expect(result.data.length).toBeGreaterThan(0);
    expect(result.data.every((job) => job.title.includes("Software"))).toBe(true);
  });

  it("toggles favorite state", async () => {
    const repository = new JobRepository();
    const service = new JobService(repository);
    const jobId = "job_0010";

    const favorited = await service.favoriteJob(userId, jobId, true);
    expect(favorited.isFavorite).toBe(true);
    expect(favorited.engagementState).toBe("favorited");
  });
});
