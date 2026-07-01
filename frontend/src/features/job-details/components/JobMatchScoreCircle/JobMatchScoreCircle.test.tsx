import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobMatchScoreCircle } from "./JobMatchScoreCircle";

describe("JobMatchScoreCircle", () => {
  it("renders score and accessibility label", () => {
    render(<JobMatchScoreCircle score={92} label="Excelente Match" />);

    expect(screen.getByText("92%")).toBeInTheDocument();
    expect(screen.getByText("Excelente Match")).toBeInTheDocument();
    expect(screen.getByLabelText("92% de compatibilidade")).toBeInTheDocument();
  });
});
