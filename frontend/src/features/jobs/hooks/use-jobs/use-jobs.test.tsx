import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { useJobs } from "./use-jobs";

describe("useJobs", () => {
  it("loads jobs list via react query", async () => {
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useJobs({ limit: 10 }), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(10);
    expect(result.current.data?.meta.total).toBe(150);
  });
});
