import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginPage } from "./LoginPage";

vi.mock("../../hooks/use-auth", () => ({
  useAuth: () => ({
    isLoading: false,
  }),
}));

vi.mock("../../hooks/use-auth-mutations", () => ({
  useLoginMutation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

describe("LoginPage", () => {
  it("renders google login button and branding", () => {
    render(<LoginPage />);

    expect(screen.getByText("JobTrack AI")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar com Google/i })).toBeInTheDocument();
    expect(screen.getByText(/Sua busca por emprego/i)).toBeInTheDocument();
  });
});
