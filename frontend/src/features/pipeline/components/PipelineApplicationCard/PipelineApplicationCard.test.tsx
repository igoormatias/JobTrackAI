import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { Application } from "@/types";

import { PipelineApplicationCard } from "./PipelineApplicationCard";

const baseApplication: Application = {
  id: "app_1",
  jobId: "job_1",
  companyId: "c1",
  userId: "u1",
  stage: "applied",
  status: "active",
  notes: null,
  nextStep: null,
  nextInterviewAt: null,
  job: {
    id: "job_1",
    title: "Frontend Engineer",
    company: { id: "c1", name: "Nubank", slug: "nubank", logoUrl: null },
    modality: "remote",
    location: "São Paulo, SP",
    area: "frontend",
    technologies: [{ id: "t1", name: "React", slug: "react" }],
    sourceUrl: "https://example.com",
    status: "active",
    isFavorite: false,
    salaryMin: null,
    salaryMax: null,
    updatedAt: "2026-06-01T12:00:00.000Z",
    matchScore: {
      score: 90,
      label: "excellent",
      reasons: [],
      missingSkills: [],
    },
  },
  timeline: [],
  appliedAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2026-06-01T12:00:00.000Z",
  lastStageUpdatedAt: "2024-03-20T10:00:00.000Z",
};

describe("PipelineApplicationCard", () => {
  it("renders application data and desktop actions", () => {
    render(
      <PipelineApplicationCard
        application={baseApplication}
        onOpenDetails={vi.fn()}
        onFavorite={vi.fn()}
      />,
    );

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Nubank")).toBeInTheDocument();
    expect(screen.getByLabelText("Abrir processo")).toBeInTheDocument();
  });

  it("applies favorite surface styles when job is favorited", () => {
    const { container } = render(
      <PipelineApplicationCard
        application={{
          ...baseApplication,
          job: { ...baseApplication.job, isFavorite: true },
        }}
        onOpenDetails={vi.fn()}
        onFavorite={vi.fn()}
      />,
    );

    const card = container.querySelector('[aria-label="Frontend Engineer em Nubank"]');
    expect(card).toHaveClass("border-amber-500/50");
    expect(card).toHaveClass("bg-amber-500/5");
    expect(screen.getByText("Favorita")).toBeInTheDocument();
  });

  it("shows stage updated date from lastStageUpdatedAt, not updatedAt", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));

    render(
      <PipelineApplicationCard
        application={baseApplication}
        onOpenDetails={vi.fn()}
        onFavorite={vi.fn()}
      />,
    );

    const stageDate = screen.getByTestId("pipeline-stage-updated-at");
    expect(stageDate.textContent).toMatch(/há (cerca de )?2 anos/);

    vi.useRealTimers();
  });
});
