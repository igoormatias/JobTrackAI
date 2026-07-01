import { describe, expect, it } from "vitest";

import { formatSalaryRange } from "./format-salary-range";

describe("formatSalaryRange", () => {
  it("formats min and max range in BRL", () => {
    const result = formatSalaryRange(8000, 12000);

    expect(result).toContain("8");
    expect(result).toContain("12");
  });

  it("returns fallback when both values are null", () => {
    expect(formatSalaryRange(null, null)).toBe("A combinar");
  });
});
