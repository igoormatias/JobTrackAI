import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { JobsSearchBar } from "./JobsSearchBar";

describe("JobsSearchBar", () => {
  it("updates search value and clears input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<JobsSearchBar value="" onChange={onChange} />);

    await user.type(screen.getByRole("searchbox"), "react");
    expect(onChange).toHaveBeenCalled();

    render(<JobsSearchBar value="react" onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Limpar busca" }));
    expect(onChange).toHaveBeenCalledWith("");
  });
});
