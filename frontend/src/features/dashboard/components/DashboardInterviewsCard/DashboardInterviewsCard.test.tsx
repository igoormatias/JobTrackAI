import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { DashboardInterviewsCard } from "./DashboardInterviewsCard";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("DashboardInterviewsCard", () => {
  it("renders interview details", () => {
    render(
      <DashboardInterviewsCard
        interviews={[
          {
            id: "i1",
            applicationId: "a1",
            jobTitle: "Frontend Engineer",
            companyName: "Nubank",
            scheduledAt: "2026-06-28T14:00:00.000Z",
            stage: "Entrevista técnica",
            status: "Entrevista técnica",
            link: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("Frontend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Nubank")).toBeInTheDocument();
  });

  it("shows empty state when no interviews", () => {
    render(<DashboardInterviewsCard interviews={[]} />);

    expect(screen.getByText("Nenhuma entrevista agendada")).toBeInTheDocument();
  });
});
