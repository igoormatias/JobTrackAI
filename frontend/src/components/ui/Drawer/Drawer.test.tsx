import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./Drawer";

describe("Drawer", () => {
  it("should render trigger", () => {
    render(
      <Sheet>
        <SheetTrigger>Open Drawer</SheetTrigger>
        <SheetContent>
          <SheetTitle>Drawer Title</SheetTitle>
        </SheetContent>
      </Sheet>,
    );

    expect(screen.getByRole("button", { name: "Open Drawer" })).toBeInTheDocument();
  });
});
