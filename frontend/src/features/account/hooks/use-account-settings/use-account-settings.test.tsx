import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeProvider } from "@/providers/theme-provider";
import { createQueryWrapper } from "@/test/query-wrapper";

import { useAccountSettings } from "./use-account-settings";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/settings",
}));

describe("useAccountSettings", () => {
  it("loads settings and exposes save handler", async () => {
    const { Wrapper: QueryWrapper } = createQueryWrapper();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryWrapper>
        <ThemeProvider>{children}</ThemeProvider>
      </QueryWrapper>
    );

    const { result } = renderHook(() => useAccountSettings(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings?.theme).toBeDefined();
    expect(typeof result.current.saveSettings).toBe("function");
  });
});
