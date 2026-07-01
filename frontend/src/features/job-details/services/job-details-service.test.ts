import { describe, expect, it } from "vitest";

import {
  getJobDetails,
  getJobInsights,
  getJobMatch,
  getJobTimeline,
  getLearningGaps,
  getRelatedJobs,
} from "./job-details-service";

describe("job-details-service", () => {
  it("loads all job details endpoints", async () => {
    const list = await getJobDetails("job_0001");
    expect(list.id).toBe("job_0001");

    const match = await getJobMatch("job_0001");
    expect(match.matchScore.score).toBeGreaterThan(0);

    const related = await getRelatedJobs("job_0001");
    expect(related.length).toBeGreaterThan(0);

    const timeline = await getJobTimeline("job_0001");
    expect(Array.isArray(timeline)).toBe(true);

    const insights = await getJobInsights("job_0001");
    expect(insights.length).toBeGreaterThan(0);

    const gaps = await getLearningGaps("job_0001");
    expect(Array.isArray(gaps)).toBe(true);
  });
});
