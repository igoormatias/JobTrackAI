import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { PipelineKanbanBoard } from "./PipelineKanbanBoard";

vi.mock("../PipelineDraggableCard", () => ({
  PipelineDraggableCard: ({ application }: { application: { job: { title: string } } }) => (
    <div>{application.job.title}</div>
  ),
}));

describe("PipelineKanbanBoard", () => {
  it("renders columns", () => {
    const { Wrapper } = createQueryWrapper();

    render(
      <Wrapper>
        <PipelineKanbanBoard
          columns={[
            {
              stage: "applied",
              label: "Aplicadas",
              count: 1,
              applications: [
                {
                  id: "a1",
                  jobId: "j1",
                  companyId: "c1",
                  userId: "u1",
                  stage: "applied",
                  status: "active",
                  notes: null,
                  nextStep: null,
                  nextInterviewAt: null,
                  job: {
                    id: "j1",
                    title: "Engineer",
                    company: { id: "c1", name: "Acme", slug: "acme", logoUrl: null },
                    modality: "remote",
                    location: "SP",
                    area: "frontend",
                    technologies: [],
                    sourceUrl: "https://example.com",
                    status: "active",
                    isFavorite: false,
                    updatedAt: new Date().toISOString(),
                    matchScore: { score: 80, label: "good", reasons: [], missingSkills: [] },
                  },
                  timeline: [],
                  appliedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
            },
          ]}
          onMove={vi.fn()}
          onOpenDetails={vi.fn()}
          onFavorite={vi.fn()}
          onDelete={vi.fn()}
          onScheduleInterview={vi.fn()}
        />
      </Wrapper>,
    );

    expect(screen.getByText("Aplicadas")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
  });
});
