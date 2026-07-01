import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { useJobMatchQuery } from "./use-job-match-query";

describe("useJobMatchQuery", () => {
  it("loads match when enabled", async () => {
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useJobMatchQuery("job_0001", true), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.matchScore.score).toBeGreaterThan(0);
  });

  it("stays idle when disabled", () => {
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useJobMatchQuery("job_0001", false), { wrapper: Wrapper });

    expect(result.current.fetchStatus).toBe("idle");
  });
});
