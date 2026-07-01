import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { useJobDetailsQuery } from "./use-job-details-query";

describe("useJobDetailsQuery", () => {
  it("loads job details when enabled", async () => {
    const { Wrapper } = createQueryWrapper();

    const { result } = renderHook(() => useJobDetailsQuery("job_0001"), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.id).toBe("job_0001");
  });
});
