import { describe, expect, it } from "vitest";

import { parseJobPostingSalary } from "./parse-job-posting-salary.js";

describe("parseJobPostingSalary", () => {
  it("parses monthly BRL range from QuantitativeValue", () => {
    const result = parseJobPostingSalary({
      "@type": "MonetaryAmount",
      currency: "BRL",
      value: {
        "@type": "QuantitativeValue",
        minValue: 8000,
        maxValue: 12000,
        unitText: "MONTH",
      },
    });

    expect(result).toEqual({ salaryMin: 8000, salaryMax: 12000 });
  });

  it("converts yearly values to monthly", () => {
    const result = parseJobPostingSalary({
      currency: "BRL",
      value: {
        minValue: 96000,
        maxValue: 120000,
        unitText: "YEAR",
      },
    });

    expect(result).toEqual({ salaryMin: 8000, salaryMax: 10000 });
  });

  it("returns null for non-BRL currency", () => {
    expect(
      parseJobPostingSalary({
        currency: "USD",
        value: { minValue: 5000, maxValue: 7000 },
      }),
    ).toBeNull();
  });

  it("returns null when no values present", () => {
    expect(parseJobPostingSalary({ currency: "BRL" })).toBeNull();
  });
});
