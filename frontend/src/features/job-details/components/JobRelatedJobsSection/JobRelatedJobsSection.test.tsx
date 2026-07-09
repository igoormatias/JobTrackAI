import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TestProviders } from "@/test/providers";

import { JobRelatedJobsSection } from "./JobRelatedJobsSection";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const createJob = (id: string) => ({
  id,
  title: `Engineer ${id}`,
  slug: `engineer-${id}`,
  companyId: "c1",
  company: { id: "c1", name: "Acme", slug: "acme", logoUrl: null },
  area: "frontend" as const,
  seniority: "senior" as const,
  modality: "remote" as const,
  location: "SP",
  salaryMin: 10000,
  salaryMax: 15000,
  currency: "BRL" as const,
  description: "Desc",
  requirements: ["React"],
  benefits: ["VR"],
  technologies: [{ id: "t1", name: "React", slug: "react" }],
  source: "gupy" as const,
  sourceUrl: "https://example.com",
  status: "active" as const,
  isFavorite: false,
  engagementState: "new" as const,
  matchScore: {
    score: 80,
    label: "good" as const,
    reasons: [],
    missingSkills: [],
  },
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe("JobRelatedJobsSection", () => {
  it("renders up to five related job cards", () => {
    const jobs = Array.from({ length: 5 }, (_, index) => createJob(`job_${index + 1}`));

    render(
      <TestProviders>
        <JobRelatedJobsSection jobs={jobs} />
      </TestProviders>,
    );

    expect(screen.getByText("Vagas relacionadas")).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });
});
