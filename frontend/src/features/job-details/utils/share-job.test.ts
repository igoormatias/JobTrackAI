import { describe, expect, it, vi } from "vitest";

import { shareJobUrl } from "./share-job";

describe("shareJobUrl", () => {
  it("uses clipboard fallback when share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(global.navigator, "share", { value: undefined, configurable: true });
    Object.defineProperty(global.navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    const result = await shareJobUrl("https://example.com/jobs/1", "Frontend Engineer");

    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("https://example.com/jobs/1");
  });
});
