import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { useDashboard } from "./use-dashboard";

describe("useDashboard", () => {
  it("loads dashboard data via react query", async () => {
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useDashboard(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.kpis.length).toBeGreaterThan(0);
  });
});
