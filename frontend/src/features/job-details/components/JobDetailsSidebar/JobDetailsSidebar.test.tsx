import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { JobDetailsSidebarWidget } from "../../widgets/JobDetailsSidebarWidget";

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe("JobDetailsSidebar", () => {
  it("renders match and insights", () => {
    render(
      <JobDetailsSidebarWidget
        match={{
          matchScore: {
            score: 91,
            label: "excellent",
            reasons: [{ id: "r1", label: "React", matched: true }],
            missingSkills: [],
          },
          compatibilityLabel: "Excelente Match",
        }}
        insights={[
          {
            id: "i1",
            title: "Alta compatibilidade",
            description: "Perfil alinhado.",
            variant: "positive",
          },
        ]}
        company={{
          id: "c1",
          name: "Acme",
          slug: "acme",
          logoUrl: null,
          website: "https://acme.com",
          industry: "Tech",
          jobCount: 12,
        }}
        relatedJobs={[]}
        timeline={[]}
      />,
    );

    expect(screen.getByText("91%")).toBeInTheDocument();
    expect(screen.getByText("Insights")).toBeInTheDocument();
    expect(screen.getByText("Alta compatibilidade")).toBeInTheDocument();
    expect(screen.getByText("Acme")).toBeInTheDocument();
  });
});
