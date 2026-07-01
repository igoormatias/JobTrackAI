import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PipelineApplicationCard } from "./PipelineApplicationCard";

const application = {
  id: "app_1",
  jobId: "job_1",
  companyId: "c1",
  userId: "u1",
  stage: "applied" as const,
  status: "active" as const,
  notes: null,
  nextStep: null,
  nextInterviewAt: null,
  job: {
    id: "job_1",
    title: "Frontend Engineer",
    company: { id: "c1", name: "Nubank", slug: "nubank", logoUrl: null },
    modality: "remote" as const,
    location: "São Paulo, SP",
    area: "frontend" as const,
    technologies: [{ id: "t1", name: "React", slug: "react" }],
    sourceUrl: "https://example.com",
    isFavorite: false,
    updatedAt: new Date().toISOString(),
    matchScore: {
      score: 90,
      label: "excellent" as const,
      reasons: [],
      missingSkills: [],
    },
  },
  timeline: [],
  appliedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("PipelineApplicationCard", () => {
  it("renders application data and actions", () => {
    render(
      <PipelineApplicationCard
        application={application}
        onOpenDetails={vi.fn()}
        onFavorite={vi.fn()}
        onDelete={vi.fn()}
        onScheduleInterview={vi.fn()}
      />,
    );

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Nubank")).toBeInTheDocument();
    expect(screen.getByLabelText("Abrir detalhes")).toBeInTheDocument();
  });
});
