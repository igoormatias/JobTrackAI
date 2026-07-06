import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JobCard } from "./JobCard";

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
  location: "São Paulo, SP",
  salaryMin: 12000,
  salaryMax: 18000,
  currency: "BRL" as const,
  description: "Construir produtos de alto impacto.",
  requirements: ["React", "TypeScript"],
  benefits: ["Plano de saúde"],
  technologies: [
    { id: "t1", name: "React", slug: "react" },
    { id: "t2", name: "Next.js", slug: "nextjs" },
  ],
  source: "gupy" as const,
  sourceUrl: "https://example.com",
  status: "active" as const,
  isFavorite: false,
  engagementState: "new" as const,
  matchScore: {
    score: 92,
    label: "excellent" as const,
    reasons: [{ id: "r1", label: "React", matched: true }],
    missingSkills: [],
  },
  publishedAt: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe("JobCard", () => {
  it("renders job details and actions", () => {
    render(<JobCard job={job} />);

    expect(screen.getByText("Senior Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText(/Nubank/)).toBeInTheDocument();
    expect(screen.getByText(/92%/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar vaga" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ver detalhes/i })).toHaveAttribute("href", "/jobs/job_1");
    expect(screen.getByRole("button", { name: "Abrir vaga" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar processo" })).toBeInTheDocument();
  });

  it("calls favorite and pipeline callbacks", async () => {
    const user = userEvent.setup();
    const onFavorite = vi.fn();
    const onAddToPipeline = vi.fn();

    render(<JobCard job={job} onFavorite={onFavorite} onAddToPipeline={onAddToPipeline} />);

    await user.click(screen.getByRole("button", { name: "Salvar vaga" }));
    await user.click(screen.getByRole("button", { name: "Iniciar processo" }));

    expect(onFavorite).toHaveBeenCalledWith(job);
    expect(onAddToPipeline).toHaveBeenCalledWith(job);
  });
});
