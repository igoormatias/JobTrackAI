import { describe, expect, it } from "vitest";

import { JobRepository } from "../repositories/job.repository.js";
import { JobDetailsService } from "../services/job-details.service.js";
import { JobService } from "../services/job.service.js";

describe("JobDetailsService", () => {
  it("returns job match with compatibility label", () => {
    const repository = new JobRepository();
    const service = new JobDetailsService(new JobService(repository), repository);

    const match = service.getJobMatch("job_0001");

    expect(match.matchScore.score).toBeGreaterThan(0);
    expect(match.compatibilityLabel).toBeTruthy();
  });

  it("returns related jobs excluding current job", () => {
    const repository = new JobRepository();
    const service = new JobDetailsService(new JobService(repository), repository);

    const related = service.getRelatedJobs("job_0001");

    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(5);
    expect(related.every((job) => job.id !== "job_0001")).toBe(true);
  });

  it("returns timeline after applying", () => {
    const repository = new JobRepository();
    const jobs = new JobService(repository);
    const service = new JobDetailsService(jobs, repository);

    jobs.applyToJob("job_0010");
    const timeline = service.getJobTimeline("job_0010");

    expect(timeline.length).toBeGreaterThan(0);
    expect(timeline.some((step) => step.status === "current")).toBe(true);
  });

  it("returns insights and learning gaps", () => {
    const repository = new JobRepository();
    const service = new JobDetailsService(new JobService(repository), repository);

    const insights = service.getJobInsights("job_0010");
    const gaps = service.getLearningGaps("job_0010");

    expect(insights.length).toBeGreaterThan(0);
    expect(gaps.length).toBeGreaterThan(0);
    expect(gaps[0]?.slug).toBeTruthy();
  });
});
