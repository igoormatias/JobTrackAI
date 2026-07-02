import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { usePipelineQuery } from "./use-pipeline-query";

describe("usePipelineQuery", () => {
  it("loads pipeline board", async () => {
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => usePipelineQuery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.columns).toHaveLength(10);
    expect(result.current.data?.kpis.totalApplications).toBeGreaterThan(0);
  });
});
