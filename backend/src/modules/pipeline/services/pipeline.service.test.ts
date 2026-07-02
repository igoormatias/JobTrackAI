import { describe, expect, it } from "vitest";

import { trackingService } from "../../tracking/application/tracking.service.js";
import { PipelineService } from "../services/pipeline.service.js";

describe("PipelineService", () => {
  const service = new PipelineService();
  const userId = "user_0001";

  it("returns pipeline with columns and kpis", async () => {
    const result = await service.getPipeline(userId);

    expect(result.columns).toHaveLength(10);
    expect(result.kpis.totalApplications).toBeGreaterThan(0);
    expect(result.totalApplications).toBe(result.kpis.totalApplications);
  });

  it("moves application between stages", async () => {
    const trackings = await trackingService.listAsync(userId);
    const applicationId = trackings[0]!.id;
    const occurredAt = new Date().toISOString();

    const updated = await service.moveApplication(userId, applicationId, "hr", occurredAt);

    expect(updated.stage).toBe("hr");
    expect(updated.timeline.some((event) => event.type === "stage_changed")).toBe(true);
  });

  it("returns timeline for application", async () => {
    const trackings = await trackingService.listAsync(userId);
    const applicationId = trackings[0]!.id;

    const timeline = await service.getTimeline(userId, applicationId);

    expect(timeline.length).toBeGreaterThan(0);
  });

  it("filters pipeline by search query", async () => {
    const result = await service.getPipeline(userId, { q: "Software" });

    expect(result.totalApplications).toBeGreaterThan(0);
  });
});
