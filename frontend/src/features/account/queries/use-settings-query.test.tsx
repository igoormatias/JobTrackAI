import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { useSettingsQuery } from "./use-settings-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/settings",
}));

describe("useSettingsQuery", () => {
  it("loads settings from API", async () => {
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSettingsQuery(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.theme).toBeDefined();
    expect(result.current.data?.jobRefreshFrequency).toBeDefined();
  });
});
