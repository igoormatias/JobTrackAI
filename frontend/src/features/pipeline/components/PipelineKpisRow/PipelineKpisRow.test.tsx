import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PipelineKpisRow } from "./PipelineKpisRow";

describe("PipelineKpisRow", () => {
  it("renders pipeline kpis", () => {
    render(
      <PipelineKpisRow
        kpis={{
          totalApplications: 12,
          interviews: 4,
          offers: 2,
          rejections: 1,
          conversionRate: 25,
          avgDaysPerStage: 4.2,
        }}
      />,
    );

    expect(screen.getByText("Candidaturas")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("25%")).toBeInTheDocument();
  });
});
