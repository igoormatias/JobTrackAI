import { describe, expect, it } from "vitest";

import { DASHBOARD_TOP_MATCH_THRESHOLD } from "../../../shared/domain/match-weights.js";

describe("dashboard top jobs threshold", () => {
  it("filters jobs below 70% from Melhores vagas", () => {
    const scored = [{ score: 72 }, { score: 69 }, { score: 70 }, { score: 41 }];
    const top = scored.filter((item) => item.score >= DASHBOARD_TOP_MATCH_THRESHOLD);
    expect(top.map((item) => item.score)).toEqual([72, 70]);
  });
});
