import { describe, expect, it } from "vitest";

import type { Job } from "@/types/job";
import { sortJobsByMatchAndDate } from "./job-sorter";

const job = (id: string, score: number, date: string): Job =>
  ({
    id,
    matchScore: { score, label: "good", reasons: [], missingSkills: [] },
    publishedAt: date,
  }) as unknown as Job;

describe("sortJobsByMatchAndDate", () => {
  it("sorts by match score desc then published date desc", () => {
    const sorted = sortJobsByMatchAndDate([
      job("a", 70, "2025-01-01T00:00:00.000Z"),
      job("b", 90, "2025-01-02T00:00:00.000Z"),
      job("c", 90, "2025-01-03T00:00:00.000Z"),
    ]);

    expect(sorted.map((item) => item.id)).toEqual(["c", "b", "a"]);
  });
});
