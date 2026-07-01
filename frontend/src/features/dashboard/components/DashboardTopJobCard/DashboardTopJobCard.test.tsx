import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardTopJobCard } from "./DashboardTopJobCard";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const job = {
  id: "job_1",
  title: "Senior Frontend Engineer",
  slug: "senior-frontend",
  companyId: "c1",
  company: { id: "c1", name: "Nubank", slug: "nubank", logoUrl: null },
  area: "frontend" as const,
  seniority: "senior" as const,
  modality: "remote" as const,
  location: "SP",
  salaryMin: 12000,
  salaryMax: 18000,
  currency: "BRL" as const,
  description: "",
  requirements: [],
  benefits: [],
  technologies: [],
  source: "gupy" as const,
  sourceUrl: "https://example.com",
  status: "active" as const,
  isFavorite: false,
  engagementState: "new" as const,
  matchScore: { score: 92, label: "excellent" as const, reasons: [], missingSkills: [] },
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("DashboardTopJobCard", () => {
  it("renders job info and view link", () => {
    render(<DashboardTopJobCard job={job} />);

    expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Nubank/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver vaga" })).toHaveAttribute("href", "/jobs/job_1");
    expect(screen.getByText(/92%/)).toBeInTheDocument();
  });
});
