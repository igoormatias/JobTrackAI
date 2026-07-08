import { describe, expect, it } from "vitest";

import { DASHBOARD_TOP_MATCH_THRESHOLD } from "../../../shared/domain/match-weights.js";

describe("dashboard top jobs threshold", () => {
  it("filters jobs below 60% from Melhores vagas", () => {
    const scored = [{ score: 72 }, { score: 59 }, { score: 60 }, { score: 41 }];
    const top = scored.filter((item) => item.score >= DASHBOARD_TOP_MATCH_THRESHOLD);
    expect(top.map((item) => item.score)).toEqual([72, 60]);
  });
});
