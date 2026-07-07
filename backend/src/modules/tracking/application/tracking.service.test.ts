import { describe, expect, it } from "vitest";

import { TrackingService } from "./tracking.service.js";
import { inMemoryJobTrackingRepository } from "../infrastructure/repositories/in-memory-job-tracking.repository.js";

describe("TrackingService list filters", () => {
  const service = new TrackingService(inMemoryJobTrackingRepository);
  const userId = "user_0001";

  it("filters by technology", () => {
    const result = service.list(userId, { technology: "react" });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((item) => item.job.technologies.some((tech) => tech.name.toLowerCase().includes("react")))).toBe(
      true,
    );
  });

  it("filters by minimum match score", () => {
    const result = service.list(userId, { matchMin: 80 });
    expect(result.every((item) => item.job.matchScore.score >= 80)).toBe(true);
  });

  it("searches stage labels and job titles", () => {
    const byStage = service.list(userId, { q: "triagem" });
    const byTitle = service.list(userId, { q: "software" });

    expect(byStage.some((item) => item.stage === "hr")).toBe(true);
    expect(byTitle.length).toBeGreaterThan(0);
  });

  it("sorts favorites first", () => {
    const result = service.list(userId, { sortBy: "favorite" });
    const lastFavoriteIndex = result.map((item) => item.isFavorite).lastIndexOf(true);
    const firstNonFavoriteIndex = result.findIndex((item) => !item.isFavorite);

    if (lastFavoriteIndex >= 0 && firstNonFavoriteIndex >= 0) {
      expect(lastFavoriteIndex).toBeLessThan(firstNonFavoriteIndex);
    } else {
      expect(result.some((item) => item.isFavorite)).toBe(true);
    }
  });
});
