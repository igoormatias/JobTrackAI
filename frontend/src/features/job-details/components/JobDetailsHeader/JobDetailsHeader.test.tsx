import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { JobDetailsHeader } from "./JobDetailsHeader";

describe("JobDetailsHeader", () => {
  it("renders open original job button", async () => {
    const user = userEvent.setup();

    render(
      <JobDetailsHeader
        job={{
          source: "linkedin",
          sourceUrl: "https://linkedin.com/jobs/1",
          status: "active",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Abrir vaga original \(LinkedIn\)/i }));
  });

  it("disables open button when URL unavailable", () => {
    render(
      <JobDetailsHeader
        job={{
          source: "manual",
          sourceUrl: "",
          status: "active",
        }}
      />,
    );
    expect(screen.getByRole("button", { name: /Abrir vaga original/i })).toBeDisabled();
  });
});
