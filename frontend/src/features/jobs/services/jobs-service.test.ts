import { describe, expect, it } from "vitest";

import {
  applyToJob,
  favoriteJob,
  getJob,
  listJobs,
  markJobViewed,
  removeJobApplication,
} from "@/features/jobs/services/jobs-service";

describe("jobs-service", () => {
  it("lists jobs", async () => {
    const result = await listJobs({ limit: 5 });
    expect(result.data.length).toBe(5);
  });

  it("favorites and applies to a job", async () => {
    const list = await listJobs({ limit: 1 });
    const jobId = list.data[0]!.id;

    const favorited = await favoriteJob(jobId, true);
    expect(favorited.isFavorite).toBe(true);

    const viewed = await markJobViewed(jobId);
    expect(viewed.engagementState).not.toBe("new");

    const applied = await applyToJob(jobId);
    expect(applied.engagementState).toBe("applied");

    const removed = await removeJobApplication(jobId);
    expect(removed.engagementState).not.toBe("applied");
  });

  it("returns job by id", async () => {
    const list = await listJobs({ limit: 1 });
    const job = list.data[0]!;
    const detail = await getJob(job.id);
    expect(detail.id).toBe(job.id);
  });
});
