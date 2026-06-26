import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { loginWithGoogle } from "@/features/auth/services/auth-service";
import { createQueryWrapper } from "@/test/query-wrapper";

import { OnboardingPage } from "./OnboardingPage";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: vi.fn(),
  }),
  usePathname: () => "/onboarding",
}));

describe("OnboardingPage", () => {
  beforeEach(async () => {
    await loginWithGoogle({ provider: "google" });
  });

  it("renders first onboarding step and blocks continue without selection", async () => {
    const user = userEvent.setup();
    const { Wrapper } = createQueryWrapper();

    render(
      <Wrapper>
        <AuthProvider>
          <OnboardingPage />
        </AuthProvider>
      </Wrapper>,
    );

    expect(await screen.findByText("Qual sua área profissional?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /próximo/i })).toBeDisabled();

    await user.click(screen.getByRole("radio", { name: "Frontend" }));
    expect(screen.getByRole("button", { name: /próximo/i })).toBeEnabled();
  });
});
