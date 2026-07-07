import { describe, expect, it } from "vitest";

import type { PipelineData, PipelineStage } from "@/types";

import { moveApplicationInPipelineData } from "./optimistic-pipeline-move";

const createPipelineData = (): PipelineData => ({
  totalApplications: 2,
  kpis: {
    totalApplications: 2,
    interviews: 0,
    offers: 0,
    rejections: 0,
    conversionRate: 0,
    avgDaysPerStage: 0,
  },
  columns: [
    {
      stage: "applied",
      label: "Aplicada",
      count: 1,
      applications: [
        {
          id: "app-1",
          jobId: "job-1",
          companyId: "c1",
          userId: "u1",
          stage: "applied",
          status: "active",
          notes: null,
          nextStep: null,
          nextInterviewAt: null,
          job: {
            id: "job-1",
            title: "Engineer",
            company: { id: "c1", name: "Acme", slug: "acme", logoUrl: null },
            modality: "remote",
            location: "SP",
            area: "backend",
            technologies: [],
            sourceUrl: "https://example.com",
            status: "active",
            isFavorite: false,
            salaryMin: null,
            salaryMax: null,
            updatedAt: new Date().toISOString(),
            matchScore: { score: 80, label: "good", reasons: [], missingSkills: [] },
          },
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
    {
      stage: "hr",
      label: "Triagem RH",
      count: 1,
      applications: [
        {
          id: "app-2",
          jobId: "job-2",
          companyId: "c2",
          userId: "u1",
          stage: "hr",
          status: "active",
          notes: null,
          nextStep: null,
          nextInterviewAt: null,
          job: {
            id: "job-2",
            title: "Designer",
            company: { id: "c2", name: "Beta", slug: "beta", logoUrl: null },
            modality: "remote",
            location: "SP",
            area: "frontend",
            technologies: [],
            sourceUrl: "https://example.com",
            status: "active",
            isFavorite: false,
            salaryMin: null,
            salaryMax: null,
            updatedAt: new Date().toISOString(),
            matchScore: { score: 70, label: "good", reasons: [], missingSkills: [] },
          },
          appliedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  ],
});

describe("moveApplicationInPipelineData", () => {
  it("moves application between columns optimistically", () => {
    const data = createPipelineData();
    const next = moveApplicationInPipelineData(data, "app-1", "hr" as PipelineStage);

    expect(next.columns.find((column) => column.stage === "applied")?.count).toBe(0);
    expect(next.columns.find((column) => column.stage === "hr")?.count).toBe(2);
    expect(next.columns.find((column) => column.stage === "hr")?.applications.some((app) => app.id === "app-1")).toBe(
      true,
    );
  });
});
