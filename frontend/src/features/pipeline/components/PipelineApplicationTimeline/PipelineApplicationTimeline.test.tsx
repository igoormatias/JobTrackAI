import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TooltipProvider } from "@/components/ui/Tooltip";

import { PipelineApplicationTimeline } from "./PipelineApplicationTimeline";

describe("PipelineApplicationTimeline", () => {
  it("renders timeline events in order", () => {
    render(
      <TooltipProvider>
        <PipelineApplicationTimeline
          events={[
            {
              id: "e2",
              applicationId: "a1",
              type: "applied",
              title: "Candidatura enviada",
              description: null,
              metadata: {},
              occurredAt: "2025-07-12T00:00:00.000Z",
            },
            {
              id: "e1",
              applicationId: "a1",
              type: "created",
              title: "Favoritada",
              description: null,
              metadata: {},
              occurredAt: "2025-07-10T00:00:00.000Z",
            },
          ]}
        />
      </TooltipProvider>,
    );

    expect(screen.getByText("Favoritada")).toBeInTheDocument();
    expect(screen.getByText("Candidatura enviada")).toBeInTheDocument();
  });
});
