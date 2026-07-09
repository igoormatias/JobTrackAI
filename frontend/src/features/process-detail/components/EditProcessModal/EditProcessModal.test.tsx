import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { TrackingDetail } from "@/features/tracking/services/tracking-service";

import { EditProcessModal } from "./EditProcessModal";

vi.mock("@/hooks/use-breakpoint/use-breakpoint", () => ({
  useIsDesktop: () => true,
}));

const tracking = {
  id: "trk_1",
  jobId: "job_1",
  companyId: "co_1",
  userId: "user_1",
  stage: "applied",
  status: "active",
  notes: "Nota inicial",
  nextStep: null,
  nextInterviewAt: null,
  isFavorite: false,
  priority: "MEDIUM",
  visibility: "VISIBLE",
  feedback: null,
  recruiterName: null,
  recruiterEmail: null,
  recruiterPhone: null,
  recruiterLinkedin: null,
  tags: [],
  negotiatedSalary: null,
  salaryExpectation: null,
  processLinks: null,
  aiAnalysisStatus: "idle",
  aiAnalyzedAt: null,
  timeline: [],
  createdAt: new Date().toISOString(),
  appliedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
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
    salaryMin: null,
    salaryMax: null,
    updatedAt: new Date().toISOString(),
    description: "",
  },
} satisfies TrackingDetail;

describe("EditProcessModal", () => {
  it("renders fixed header and footer actions when open", () => {
    render(
      <EditProcessModal
        open
        onOpenChange={vi.fn()}
        tracking={tracking}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Editar processo")).toBeInTheDocument();
    expect(screen.getByText("Frontend Engineer · Acme")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });
});
