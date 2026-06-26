import { describe, expect, it } from "vitest";

import { PIPELINE_STAGES } from "../constants/mock-data";
import { buildFixtureStore } from "./build-fixture-store";

describe("buildFixtureStore", () => {
  it("builds realistic fixture volumes", () => {
    const store = buildFixtureStore();

    expect(store.companies).toHaveLength(30);
    expect(store.jobs).toHaveLength(150);
    expect(store.applications).toHaveLength(18);
    expect(store.notifications.length).toBeGreaterThanOrEqual(20);
    expect(store.favoriteJobIds.size).toBe(12);
    expect(store.jobs.filter((job) => job.isFavorite)).toHaveLength(12);
    expect(store.dashboard.kpis.length).toBeGreaterThan(0);
  });

  it("keeps application references consistent", () => {
    const store = buildFixtureStore();
    const jobIds = new Set(store.jobs.map((job) => job.id));
    const companyIds = new Set(store.companies.map((company) => company.id));

    store.applications.forEach((application) => {
      expect(jobIds.has(application.jobId)).toBe(true);
      expect(companyIds.has(application.companyId)).toBe(true);
      expect(application.timeline.length).toBeGreaterThan(0);
    });
  });

  it("distributes applications across pipeline stages", () => {
    const store = buildFixtureStore();
    const stages = new Set(store.applications.map((app) => app.stage));

    PIPELINE_STAGES.forEach((stage) => {
      expect(stages.has(stage)).toBe(true);
    });
  });
});
