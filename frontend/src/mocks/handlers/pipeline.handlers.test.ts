import { describe, expect, it } from "vitest";

import { apiClient } from "@/lib/api-client";
import type { Application, PipelineData } from "@/types";

describe("pipeline handlers", () => {
  it("returns pipeline with kpis and columns", async () => {
    const { data } = await apiClient.get<{ data: PipelineData }>("/pipeline");

    expect(data.data.columns).toHaveLength(10);
    expect(data.data.kpis.totalApplications).toBeGreaterThan(0);
  });

  it("moves application between stages", async () => {
    const { data: pipeline } = await apiClient.get<{ data: PipelineData }>("/pipeline");
    const application = pipeline.data.columns.flatMap((column) => column.applications)[0]!;

    const { data } = await apiClient.patch<{ data: Application }>(
      `/pipeline/${application.id}/status`,
      { stage: "hr" },
    );

    expect(data.data.stage).toBe("hr");
  });

  it("returns application timeline", async () => {
    const { data: pipeline } = await apiClient.get<{ data: PipelineData }>("/pipeline");
    const application = pipeline.data.columns.flatMap((column) => column.applications)[0]!;

    const { data } = await apiClient.get<{ data: Application["timeline"] }>(
      `/pipeline/${application.id}/timeline`,
    );

    expect((data.data ?? []).length).toBeGreaterThan(0);
  });
});
