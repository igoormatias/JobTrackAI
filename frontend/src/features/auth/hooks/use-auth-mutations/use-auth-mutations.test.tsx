import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { loginWithGoogle } from "@/features/auth/services/auth-service";
import { createQueryWrapper } from "@/test/query-wrapper";

import { useCurrentUserQuery } from "./use-auth-mutations";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => "/dashboard",
}));

describe("useCurrentUserQuery", () => {
  beforeEach(async () => {
    await loginWithGoogle({ provider: "google", idToken: "test-id-token" });
  });

  it("loads authenticated user after login", async () => {
    const { Wrapper: QueryWrapper } = createQueryWrapper();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryWrapper>
        <AuthProvider>{children}</AuthProvider>
      </QueryWrapper>
    );

    const { result } = renderHook(() => useCurrentUserQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.user.email).toBe("matias.silva@email.com");
  });
});
