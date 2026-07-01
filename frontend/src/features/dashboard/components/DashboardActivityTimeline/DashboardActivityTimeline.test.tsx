import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardActivityTimeline } from "./DashboardActivityTimeline";

describe("DashboardActivityTimeline", () => {
  it("renders activity items", () => {
    render(
      <DashboardActivityTimeline
        activities={[
          {
            id: "1",
            type: "job",
            title: "Nova vaga encontrada",
            description: "React Dev · Nubank",
            occurredAt: new Date().toISOString(),
          },
        ]}
      />,
    );

    expect(screen.getByText("Nova vaga encontrada")).toBeInTheDocument();
    expect(screen.getByText("React Dev · Nubank")).toBeInTheDocument();
  });

  it("shows empty state when no activities", () => {
    render(<DashboardActivityTimeline activities={[]} />);

    expect(screen.getByText("Nenhuma atividade recente")).toBeInTheDocument();
  });
});
