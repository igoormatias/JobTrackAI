import { describe, expect, it } from "vitest";

import {
  deleteApplication,
  favoriteApplication,
  getApplicationTimeline,
  getPipeline,
  moveApplication,
} from "./pipeline-service";

describe("pipeline-service", () => {
  it("loads pipeline endpoints", async () => {
    const pipeline = await getPipeline();
    expect(pipeline.columns).toHaveLength(9);

    const application = pipeline.columns.flatMap((column) => column.applications)[0]!;
    const moved = await moveApplication(application.id, "hr");
    expect(moved.stage).toBe("hr");

    const favorited = await favoriteApplication(application.id);
    expect(favorited.job.isFavorite).toBe(true);

    const timeline = await getApplicationTimeline(application.id);
    expect(timeline.length).toBeGreaterThan(0);

    await deleteApplication(application.id);
  });
});
