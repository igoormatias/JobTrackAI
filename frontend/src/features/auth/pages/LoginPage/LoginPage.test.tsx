import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginPage } from "./LoginPage";

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <button type="button" className="w-full">Entrar com Google</button>,
}));

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

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "JobTrack AI" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar com Google/i })).toHaveClass("w-full");
    expect(screen.getByText(/Sua busca por emprego/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Termos de Serviço/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Política de Privacidade/i })).toBeInTheDocument();
  });
});
