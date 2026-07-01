import { describe, expect, it } from "vitest";

import type { Company } from "@/types/company";
import { prioritizeCompaniesByArea } from "./company-prioritizer";

const company = (name: string): Company =>
  ({
    id: name,
    name,
    slug: name.toLowerCase(),
    industry: "Tech",
    location: "SP",
    logoUrl: null,
    jobCount: 1,
    createdAt: "",
    updatedAt: "",
  }) as unknown as Company;

describe("prioritizeCompaniesByArea", () => {
  it("prioritizes Nubank for frontend profile", () => {
    const sorted = prioritizeCompaniesByArea(
      [company("Magalu"), company("Nubank"), company("Stone")],
      "frontend",
    );

    expect(sorted[0]?.name).toBe("Nubank");
  });

  it("prioritizes QuintoAndar for product owner profile", () => {
    const sorted = prioritizeCompaniesByArea(
      [company("Nubank"), company("QuintoAndar"), company("Loft")],
      "product_owner",
    );

    expect(sorted[0]?.name).toBe("QuintoAndar");
  });
});
