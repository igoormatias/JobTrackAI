import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
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

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("AccountTabsNav", () => {
  it("renders Perfil and Preferências links", () => {
    render(<AccountTabsNav />);

    expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("tab", { name: "Preferências" })).toHaveAttribute("href", "/settings");
  });

  it("marks Perfil as active on /profile", () => {
    mockUsePathname.mockReturnValue("/profile");
    render(<AccountTabsNav />);

    expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Preferências" })).toHaveAttribute("aria-selected", "false");
  });

  it("marks Preferências as active on /settings", () => {
    mockUsePathname.mockReturnValue("/settings");
    render(<AccountTabsNav />);

    expect(screen.getByRole("tab", { name: "Preferências" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Perfil" })).toHaveAttribute("aria-selected", "false");
  });
});
