import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DashboardKpiCard } from "./DashboardKpiCard";

describe("DashboardKpiCard", () => {
  it("renders value, change and accessible label", () => {
    render(
      <DashboardKpiCard
        kpi={{
          id: "kpi_new_jobs",
          label: "Novas vagas",
          value: 12,
          change: 3,
          changeLabel: "esta semana",
        }}
      />,
    );

    expect(screen.getByText("Novas vagas")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("+3 esta semana")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Novas vagas: 12. Variação: +3 esta semana"),
    ).toBeInTheDocument();
  });
});
