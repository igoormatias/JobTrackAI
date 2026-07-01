import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobWhyThisJobCard } from "./JobWhyThisJobCard";

describe("JobWhyThisJobCard", () => {
  it("renders matched reasons", () => {
    render(
      <JobWhyThisJobCard
        reasons={[
          { id: "r1", label: "React", matched: true },
          { id: "r2", label: "AWS", matched: false },
        ]}
      />,
    );

    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.queryByText(/AWS/)).not.toBeInTheDocument();
  });
});
