import { describe, expect, it } from "vitest";

import { PipelineRepository } from "../repositories/pipeline.repository.js";
import { PipelineService } from "../services/pipeline.service.js";

describe("PipelineService", () => {
  it("returns pipeline with columns and kpis", () => {
    const repository = new PipelineRepository();
    const service = new PipelineService(repository);

    const result = service.getPipeline();

    expect(result.columns).toHaveLength(9);
    expect(result.kpis.totalApplications).toBeGreaterThan(0);
    expect(result.totalApplications).toBe(result.kpis.totalApplications);
  });

  it("moves application between stages", () => {
    const repository = new PipelineRepository();
    const service = new PipelineService(repository);
    const applicationId = repository.findAll()[0]!.id;

    const updated = service.moveApplication(applicationId, "hr");

    expect(updated.stage).toBe("hr");
    expect(updated.timeline.some((event) => event.type === "stage_changed")).toBe(true);
  });

  it("returns timeline for application", () => {
    const repository = new PipelineRepository();
    const service = new PipelineService(repository);
    const applicationId = repository.findAll()[0]!.id;

    const timeline = service.getTimeline(applicationId);

    expect(timeline.length).toBeGreaterThan(0);
  });

  it("filters pipeline by search query", () => {
    const repository = new PipelineRepository();
    const service = new PipelineService(repository);

    const result = service.getPipeline({ q: "Software" });

    expect(result.totalApplications).toBeGreaterThan(0);
  });
});
