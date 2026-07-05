import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";

import { AccountTabsNav } from "./AccountTabsNav";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockUsePathname = vi.fn(() => "/profile");
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

const renderNav = () =>
  render(
    <Suspense fallback={null}>
      <AccountTabsNav />
    </Suspense>,
  );

describe("AccountTabsNav", () => {
  it("renders account tabs", () => {
    renderNav();

    expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("tab", { name: "Preferências" })).toHaveAttribute("href", "/settings");
    expect(screen.getByRole("tab", { name: "Integrações" })).toHaveAttribute(
      "href",
      "/settings?tab=integrations",
    );
  });

  it("marks Perfil as active on /profile", () => {
    mockUsePathname.mockReturnValue("/profile");
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    renderNav();

    expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Preferências" })).toHaveAttribute("aria-selected", "false");
  });

  it("marks Integrações as active on /settings?tab=integrations", () => {
    mockUsePathname.mockReturnValue("/settings");
    mockUseSearchParams.mockReturnValue(new URLSearchParams("tab=integrations"));
    renderNav();

    expect(screen.getByRole("tab", { name: "Integrações" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Preferências" })).toHaveAttribute("aria-selected", "false");
  });
});
