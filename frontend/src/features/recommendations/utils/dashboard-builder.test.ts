import { describe, expect, it } from "vitest";

import type { Job } from "@/types/job";
import type { RecommendationProfile } from "../types/recommendation.types";
import {
  buildApplicationsTimeline,
  buildDashboardInsight,
  buildPersonalizedDashboard,
} from "./dashboard-builder";
import { enrichJobsWithMatch } from "./smart-filter";

const profile: RecommendationProfile = {
  area: "frontend",
  seniority: "senior",
  modality: "remote",
  location: "Brasil",
  locationPreference: { scope: "country", acceptsRelocation: false },
  salaryBand: "8k_12k",
  salaryExpectation: { min: 8000, max: 12000, currency: "BRL" },
  skillNames: ["React"],
};

const job = (area: Job["area"]): Job =>
  enrichJobsWithMatch(
    [
      {
        id: `job_${area}`,
        title: `${area} dev`,
        slug: area,
        companyId: "c1",
        company: { id: "c1", name: "Co", slug: "co", logoUrl: null },
        area,
        seniority: "senior",
        modality: "remote",
        location: "SP",
        salaryMin: 8000,
        salaryMax: 12000,
        currency: "BRL",
        description: "",
        requirements: ["React"],
        benefits: [],
        technologies: [{ id: "t1", name: "React", slug: "react" }],
        source: "gupy",
        sourceUrl: "url",
        status: "active",
        isFavorite: false,
        engagementState: "new",
        matchScore: { score: 0, label: "low", reasons: [], missingSkills: [] },
        publishedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Job,
    ],
    profile,
  )[0]!;

describe("buildPersonalizedDashboard", () => {
  it("builds KPI labels aligned with dashboard spec", () => {
    const jobs = [job("frontend"), job("backend")];
    const dashboard = buildPersonalizedDashboard({ jobs, applications: [], profile });

    expect(dashboard.kpis[0]?.label).toBe("Novas vagas");
    expect(dashboard.kpis[1]?.label).toBe("Match acima de 90%");
    expect(dashboard.insight.title).toBe("Insight da semana");
    expect(dashboard.insight.message).toContain("Frontend");
    expect(dashboard.applicationsTimeline).toHaveLength(8);
  });
});

describe("buildDashboardInsight", () => {
  it("mentions primary skill in message", () => {
    const jobs = [job("frontend")];
    const compatible = jobs.filter((item) => item.area === "frontend");
    const insight = buildDashboardInsight(profile, compatible, 2);

    expect(insight.message).toContain("React");
    expect(insight.highlight).toBe("React");
  });
});

describe("buildApplicationsTimeline", () => {
  it("returns 8 weekly buckets", () => {
    const timeline = buildApplicationsTimeline([]);

    expect(timeline).toHaveLength(8);
    expect(timeline.at(-1)?.label).toBe("Esta sem.");
  });
});
