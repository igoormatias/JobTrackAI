import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("should merge tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", false && "hidden", "block")).toBe("base block");
  });
});
