import { describe, expect, it } from "vitest";

import { getEngagementState } from "./job.mapper.js";

describe("getEngagementState", () => {
  it("treats discovery tracking as not new", () => {
    const state = getEngagementState(
      {
        id: "t1",
        userId: "u1",
        jobId: "j1",
        stage: "discovery",
        isFavorite: false,
        priority: "MEDIUM",
        visibility: "VISIBLE",
        hiddenAt: null,
        lastStageUpdatedAt: new Date().toISOString(),
        notes: null,
        timeline: [],
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      false,
    );

    expect(state).toBe("applied");
  });

  it("returns favorited when tracked and favorite", () => {
    const state = getEngagementState(
      {
        id: "t1",
        userId: "u1",
        jobId: "j1",
        stage: "applied",
        isFavorite: true,
        priority: "MEDIUM",
        visibility: "VISIBLE",
        hiddenAt: null,
        lastStageUpdatedAt: new Date().toISOString(),
        notes: null,
        timeline: [],
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      false,
    );

    expect(state).toBe("favorited");
  });
});
