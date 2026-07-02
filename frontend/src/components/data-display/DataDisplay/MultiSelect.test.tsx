import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MultiSelect } from "./DataDisplay";

describe("MultiSelect", () => {
  it("adds searchable options with visible labels and chip feedback", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <MultiSelect
        searchable
        label="Competências"
        placeholder="Adicionar competência..."
        options={[
          { value: "React", label: "React" },
          { value: "TypeScript", label: "TypeScript" },
        ]}
        value={[]}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByLabelText("Competências"));

    const reactOption = screen.getByRole("option", { name: "React" });
    expect(reactOption).toHaveClass("multiselect-option");
    await user.click(reactOption);

    expect(onChange).toHaveBeenCalledWith(["React"]);
  });
});
