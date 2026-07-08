import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { JobDetailsPage } from "./JobDetailsPage";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "job_0001" }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("JobDetailsPage", () => {
  it("loads and renders job detail sections", async () => {
    const { Wrapper } = createQueryWrapper();

    render(
      <Wrapper>
        <JobDetailsPage />
      </Wrapper>,
    );

    await screen.findByRole("heading", { name: "Frontend Engineer" });

    expect(await screen.findByText("Por que essa vaga?")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Abrir vaga original/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "Iniciar processo seletivo" }).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Insights").length).toBeGreaterThan(0);
  });
});
