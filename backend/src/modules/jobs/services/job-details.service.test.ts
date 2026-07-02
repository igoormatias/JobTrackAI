import { describe, expect, it } from "vitest";

import { trackingService } from "../../tracking/application/tracking.service.js";
import { JobRepository } from "../repositories/job.repository.js";
import { JobDetailsService } from "../services/job-details.service.js";
import { JobService } from "../services/job.service.js";

const userId = "user_0001";

describe("JobDetailsService", () => {
  it("returns job match with compatibility label", async () => {
    const repository = new JobRepository();
    const service = new JobDetailsService(new JobService(repository), repository);

    const match = await service.getJobMatch(userId, "job_0001");

    expect(match.matchScore.score).toBeGreaterThan(0);
    expect(match.compatibilityLabel).toBeTruthy();
    expect(match.engineVersion).toBe("rules-v1");
  });

  it("returns related jobs excluding current job", async () => {
    const repository = new JobRepository();
    const service = new JobDetailsService(new JobService(repository), repository);

    const related = await service.getRelatedJobs(userId, "job_0001");

    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(5);
    expect(related.every((job) => job.id !== "job_0001")).toBe(true);
  });

  it("returns timeline when tracking exists", async () => {
    const repository = new JobRepository();
    const service = new JobDetailsService(new JobService(repository), repository);

    const trackings = await trackingService.listAsync(userId);
    const jobId = trackings[0]!.jobId;
    const timeline = await service.getJobTimeline(userId, jobId);

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline.some((step) => step.status === "current")).toBe(true);
  });

  it("returns insights and learning gaps", async () => {
    const repository = new JobRepository();
    const service = new JobDetailsService(new JobService(repository), repository);

    const insights = await service.getJobInsights(userId, "job_0010");
    const gaps = await service.getLearningGaps(userId, "job_0010");

    expect(insights.length).toBeGreaterThan(0);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0]?.slug).toBeTruthy();
  });
});
