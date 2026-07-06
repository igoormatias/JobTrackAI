import { render, screen } from "@testing-library/react";
import { Briefcase } from "lucide-react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders description without text-balance class", () => {
    const { container } = render(
      <EmptyState
        icon={Briefcase}
        title="Filtros muito restritivos"
        description="Amplie a busca para descobrir mais vagas compatíveis com você."
      />,
    );

    const description = screen.getByText(/Amplie a busca/);
    expect(description.className).not.toContain("text-balance");
    expect(description.className).toContain("break-words");
    expect(container.querySelector(".max-w-md")).toBeInTheDocument();
  });
});
