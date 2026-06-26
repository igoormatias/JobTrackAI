import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("should render text", () => {
    render(<Badge>Remote</Badge>);
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  it("should apply variant", () => {
    render(<Badge variant="success">Match</Badge>);
    expect(screen.getByText("Match")).toHaveClass("bg-primary/20");
  });
});
