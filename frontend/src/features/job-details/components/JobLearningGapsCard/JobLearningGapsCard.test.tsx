import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobLearningGapsCard } from "./JobLearningGapsCard";

describe("JobLearningGapsCard", () => {
  it("renders gaps with importance badges", () => {
    render(
      <JobLearningGapsCard
        gaps={[
          {
            id: "g1",
            name: "Docker",
            slug: "docker",
            importance: "high",
            category: "Infraestrutura",
          },
        ]}
      />,
    );

    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("Alta")).toBeInTheDocument();
    expect(screen.getByText("Infraestrutura")).toBeInTheDocument();
  });
});
