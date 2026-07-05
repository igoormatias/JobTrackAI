import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LoginPage } from "./LoginPage";

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: () => <button type="button">Google hidden</button>,
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
    isError: false,
    isSuccess: false,
  }),
}));

describe("LoginPage", () => {
  it("renders hero, product previews and google login", () => {
    render(<LoginPage />);

    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Organize sua carreira/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pipeline", level: 3 })).toBeInTheDocument();
    expect(screen.getByText(/IA de Carreira/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar com Google/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Termos de Serviço/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Política de Privacidade/i })).toBeInTheDocument();
    expect(screen.getByText(/v1\.5\.0/)).toBeInTheDocument();
  });
});
