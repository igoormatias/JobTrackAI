import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardInsightCard } from "./DashboardInsightCard";

describe("DashboardInsightCard", () => {
  it("renders insight title and message", () => {
    render(
      <DashboardInsightCard
        insight={{
          title: "Insight da semana",
          message: "Encontramos mais vagas Frontend esta semana.",
          trendPercent: 18,
        }}
      />,
    );

    expect(screen.getByText("Insight da semana")).toBeInTheDocument();
    expect(screen.getByText(/Frontend esta semana/)).toBeInTheDocument();
    expect(screen.getByText("+18% esta semana")).toBeInTheDocument();
  });
});
