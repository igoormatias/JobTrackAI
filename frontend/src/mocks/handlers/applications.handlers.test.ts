import { describe, expect, it } from "vitest";

import { apiClient } from "@/lib/api-client";
import type { ApiResponse, Application } from "@/types";

describe("applications handlers", () => {
  it("updates application stage and appends timeline event", async () => {
    const { data: list } = await apiClient.get<{ data: Application[]; meta: unknown }>(
      "/applications",
      { params: { limit: 1, stage: "applied" } },
    );

    const application = list.data[0]!;
    const timelineLength = (application.timeline ?? []).length;

    const { data } = await apiClient.patch<ApiResponse<Application>>(
      `/applications/${application.id}`,
      { stage: "hr" },
    );

    expect(data.data.stage).toBe("hr");
    expect((data.data.timeline ?? []).length).toBe(timelineLength + 1);
  });
});
