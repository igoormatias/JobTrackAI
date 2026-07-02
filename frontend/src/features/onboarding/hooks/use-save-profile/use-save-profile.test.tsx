import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { loginWithGoogle } from "@/features/auth/services/auth-service";
import { createQueryWrapper } from "@/test/query-wrapper";

import { useSaveProfile } from "./use-save-profile";

describe("useSaveProfile", () => {
  beforeEach(async () => {
    await loginWithGoogle({ provider: "google", idToken: "test-id-token" });
  });

  it("saves profile draft through mutation", async () => {
    const { Wrapper } = createQueryWrapper();
    const { result } = renderHook(() => useSaveProfile(), { wrapper: Wrapper });

    await waitFor(async () => {
      const profile = await result.current.saveProfile({
        payload: {
          area: "frontend",
          skillNames: ["React"],
        },
        exists: false,
      });

      expect(profile.area).toBe("frontend");
    });
  });
});
