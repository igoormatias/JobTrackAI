import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardPipelineCard } from "./DashboardPipelineCard";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("DashboardPipelineCard", () => {
  it("renders stage counts and pipeline link", () => {
    render(
      <DashboardPipelineCard
        applicationsByStage={[
          { label: "Aplicada", value: 3 },
          { label: "Triagem RH", value: 1 },
          { label: "Descoberta", value: 0 },
        ]}
      />,
    );

    expect(screen.getByText("Pipeline")).toBeInTheDocument();
    expect(screen.getByText("Aplicada")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Triagem RH")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver pipeline" })).toHaveAttribute("href", "/pipeline");
    expect(screen.queryByText("Descoberta")).not.toBeInTheDocument();
  });

  it("shows empty state when no active stages", () => {
    render(<DashboardPipelineCard applicationsByStage={[{ label: "Aplicada", value: 0 }]} />);

    expect(screen.getByText("Nenhum processo ativo ainda.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para pipeline" })).toHaveAttribute("href", "/pipeline");
  });
});
