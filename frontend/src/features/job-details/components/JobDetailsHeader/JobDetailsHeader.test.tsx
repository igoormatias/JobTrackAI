import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JobDetailsHeader } from "./JobDetailsHeader";

describe("JobDetailsHeader", () => {
  it("renders Abrir vaga and calls handler with sourceUrl flow", async () => {
    const onOpenJob = vi.fn();
    const user = userEvent.setup();

    render(<JobDetailsHeader onOpenJob={onOpenJob} canOpenJob />);

    await user.click(screen.getByRole("button", { name: "Abrir vaga" }));
    expect(onOpenJob).toHaveBeenCalledOnce();
  });

  it("disables Abrir vaga when URL unavailable", () => {
    render(<JobDetailsHeader onOpenJob={vi.fn()} canOpenJob={false} />);
    expect(screen.getByRole("button", { name: "Abrir vaga" })).toBeDisabled();
  });
});
