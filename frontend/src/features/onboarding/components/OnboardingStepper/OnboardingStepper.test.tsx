import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { OnboardingStepper } from "./OnboardingStepper";

describe("OnboardingStepper", () => {
  it("renders progress label and children", () => {
    render(
      <OnboardingStepper stepIndex={2} totalSteps={8}>
        <p>Step content</p>
      </OnboardingStepper>,
    );

    expect(screen.getByText("Passo 3 de 8")).toBeInTheDocument();
    expect(screen.getByText("Step content")).toBeInTheDocument();
  });
});
