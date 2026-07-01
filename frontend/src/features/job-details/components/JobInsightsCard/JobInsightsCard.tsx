import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

import type { JobInsight } from "../../types/job-details.types";

export type JobInsightsCardProps = {
  insights: JobInsight[];
};

const variantClass: Record<JobInsight["variant"], string> = {
  positive: "border-emerald-500/30",
  neutral: "border-border/60",
  warning: "border-amber-500/30",
};

export const JobInsightsCard = ({ insights }: JobInsightsCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Insights</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {insights.map((insight) => (
        <div key={insight.id} className={cn("rounded-lg border p-3", variantClass[insight.variant])}>
          <p className="font-medium text-foreground">{insight.title}</p>
          <p className="text-sm text-muted-foreground">{insight.description}</p>
        </div>
      ))}
    </CardContent>
  </Card>
);
