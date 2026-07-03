import { afterEach, describe, expect, it, vi } from "vitest";

import { ProviderSyncScheduler } from "./provider-sync.scheduler.js";

describe("ProviderSyncScheduler", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should trigger run all providers on interval", async () => {
    vi.useFakeTimers();
    const execute = vi.fn().mockResolvedValue([]);
    const scheduler = new ProviderSyncScheduler({ execute } as never, 1000);

    scheduler.start();
    await vi.advanceTimersByTimeAsync(1000);

    expect(execute).toHaveBeenCalledTimes(1);
    scheduler.stop();
  });
});
