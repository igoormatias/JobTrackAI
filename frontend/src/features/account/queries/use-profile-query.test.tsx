import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { loginAuthStore } from "@/mocks/fixtures/auth-store";
import { createUserProfile } from "@/mocks/fixtures/profile-store";
import { createQueryWrapper } from "@/test/query-wrapper";

import { useProfileQuery } from "./use-profile-query";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/profile",
}));

describe("useProfileQuery", () => {
  beforeEach(() => {
    loginAuthStore();
    createUserProfile("user_0001", {
      area: "frontend",
      seniority: "senior",
      modality: "remote",
      skillNames: ["React"],
    });
  });

  it("loads profile from API", async () => {
    const { Wrapper: QueryWrapper } = createQueryWrapper();

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryWrapper>
        <AuthProvider>{children}</AuthProvider>
      </QueryWrapper>
    );

    const { result } = renderHook(() => useProfileQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.area).toBe("frontend");
  });
});
