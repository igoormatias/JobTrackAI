import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";
import type { Application } from "@/types";

import { PipelineDetailSheet } from "./PipelineDetailSheet";

vi.mock("@/hooks/use-breakpoint/use-breakpoint", () => ({
  useIsDesktop: () => false,
}));

const application = {
  id: "trk_1",
  jobId: "job_1",
  companyId: "co_1",
  userId: "user_1",
  stage: "applied",
  status: "active",
  notes: null,
  nextStep: null,
  nextInterviewAt: null,
  job: {
    id: "job_1",
    title: "Frontend Engineer",
    company: { id: "co_1", name: "Acme", slug: "acme", logoUrl: null },
    modality: "remote",
    location: "SP",
    area: "frontend",
    matchScore: { score: 85, label: "excellent", reasons: [], missingSkills: [] },
    technologies: [],
    sourceUrl: "https://portal.gupy.io/job/10115",
    status: "active",
    isFavorite: false,
    updatedAt: new Date().toISOString(),
  },
  timeline: [],
  appliedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
} satisfies Application;

describe("PipelineDetailSheet", () => {
  it("shows process details when open on mobile", () => {
    const { Wrapper } = createQueryWrapper();
    render(
      <Wrapper>
        <PipelineDetailSheet application={application} open onOpenChange={vi.fn()} />
      </Wrapper>,
    );

    expect(screen.getByText("Detalhes do processo")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });
});
