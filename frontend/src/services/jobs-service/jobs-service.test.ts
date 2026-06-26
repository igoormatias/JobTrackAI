import { describe, expect, it } from "vitest";

import { getJob, listJobs } from "./jobs-service";

describe("jobs-service", () => {
  it("lists jobs with cursor pagination", async () => {
    const response = await listJobs({ limit: 5 });

    expect(response.data).toHaveLength(5);
    expect(response.meta.total).toBe(150);
  });

  it("gets job by id", async () => {
    const response = await listJobs({ limit: 1 });
    const job = await getJob(response.data[0]!.id);

    expect(job.id).toBe(response.data[0]!.id);
  });
});
