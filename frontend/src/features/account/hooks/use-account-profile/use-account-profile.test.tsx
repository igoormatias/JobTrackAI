import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { loginAuthStore } from "@/mocks/fixtures/auth-store";
import { createUserProfile } from "@/mocks/fixtures/profile-store";
import { createQueryWrapper } from "@/test/query-wrapper";

import { useAccountProfile } from "./use-account-profile";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/profile",
}));

describe("useAccountProfile", () => {
  beforeEach(() => {
    loginAuthStore();
    createUserProfile("user_0001", {
      area: "frontend",
      seniority: "senior",
      modality: "remote",
      skillNames: ["React"],
    });
  });

  it("exposes profile with user after load", async () => {
    const { Wrapper: QueryWrapper } = createQueryWrapper();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryWrapper>
        <AuthProvider>{children}</AuthProvider>
      </QueryWrapper>
    );

    const { result } = renderHook(() => useAccountProfile(), { wrapper });

    await waitFor(() => expect(result.current.profile?.user.email).toBeTruthy());
  });
});
