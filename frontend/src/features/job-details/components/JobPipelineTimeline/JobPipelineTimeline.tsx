import { Check } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

import type { JobTimelineStep } from "../../types/job-details.types";

export type JobPipelineTimelineProps = {
  steps: JobTimelineStep[];
};

export const JobPipelineTimeline = ({ steps }: JobPipelineTimelineProps) => {
  if (steps.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Pipeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0 border-l border-border pl-4">
          {steps.map((step) => (
            <li key={step.stage} className="relative pb-5 last:pb-0">
              <span
                className={cn(
                  "absolute -left-[1.35rem] flex h-6 w-6 items-center justify-center rounded-full border bg-background",
                  step.status === "current" && "border-primary text-primary",
                  step.status === "completed" && "border-emerald-500 text-emerald-500",
                )}
              >
                {step.status === "completed" ? <Check className="h-3 w-3" /> : null}
              </span>
              <p className="text-sm font-medium text-foreground">{step.label}</p>
              {step.occurredAt ? (
                <time className="text-xs text-muted-foreground" dateTime={step.occurredAt}>
                  {new Date(step.occurredAt).toLocaleDateString("pt-BR")}
                </time>
              ) : null}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
