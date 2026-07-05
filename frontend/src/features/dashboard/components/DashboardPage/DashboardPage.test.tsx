import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { createQueryWrapper } from "@/test/query-wrapper";

import { DashboardPage } from "./DashboardPage";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("../DashboardApplicationsChart", () => ({
  DashboardApplicationsChart: () => <div>Aplicações por período</div>,
}));

vi.mock("@/features/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/features/auth")>();
  return {
    ...actual,
    useCurrentUser: () => ({
      user: { id: "u1", name: "Igor Santos", email: "igor@test.com", avatar: null },
      isLoading: false,
    }),
  };
});

describe("DashboardPage", () => {
  it("loads and renders dashboard sections", async () => {
    const { Wrapper } = createQueryWrapper();

    render(
      <Wrapper>
        <DashboardPage />
      </Wrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText("Favoritas")).toBeInTheDocument();
    });

    expect(screen.getByText(/Bom dia, Igor 👋|Boa tarde, Igor 👋|Boa noite, Igor 👋/)).toBeInTheDocument();
    expect(screen.getByText("Insight da semana")).toBeInTheDocument();
    expect(screen.getByText("Melhores vagas")).toBeInTheDocument();
    expect(screen.getByText("Atividades recentes")).toBeInTheDocument();
  });
});
