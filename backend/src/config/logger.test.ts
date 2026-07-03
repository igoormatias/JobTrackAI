import { afterEach, describe, expect, it, vi } from "vitest";

describe("shouldUsePrettyTransport", () => {
  const originalVercel = process.env.VERCEL;
  const originalLogPretty = process.env.LOG_PRETTY;

  afterEach(() => {
    if (originalVercel === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = originalVercel;
    if (originalLogPretty === undefined) delete process.env.LOG_PRETTY;
    else process.env.LOG_PRETTY = originalLogPretty;
  });

  it("never uses pretty transport on Vercel", async () => {
    vi.resetModules();
    process.env.VERCEL = "1";
    delete process.env.LOG_PRETTY;
    const { shouldUsePrettyTransport: check } = await import("./logger.js");
    expect(check()).toBe(false);
  });
});
