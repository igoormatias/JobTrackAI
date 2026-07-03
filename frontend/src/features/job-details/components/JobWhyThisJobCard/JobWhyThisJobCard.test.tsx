import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JobWhyThisJobCard } from "./JobWhyThisJobCard";

describe("JobWhyThisJobCard", () => {
  it("renders matched reasons", () => {
    render(
      <JobWhyThisJobCard
        reasons={[
          { id: "r1", label: "Cargo compatível com seu perfil", matched: true },
          { id: "r2", label: "React encontrado", matched: true },
          { id: "r3", label: "AWS", matched: false },
        ]}
      />,
    );

    expect(screen.getByText(/Cargo compatível com seu perfil/)).toBeInTheDocument();
    expect(screen.getByText(/React encontrado/)).toBeInTheDocument();
    expect(screen.queryByText(/AWS/)).not.toBeInTheDocument();
  });
});
