"use client";

import Link from "next/link";
import { GitBranch } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardChartPoint } from "@/types";

export type DashboardPipelineCardProps = {
  applicationsByStage: DashboardChartPoint[];
};

export const DashboardPipelineCard = ({ applicationsByStage }: DashboardPipelineCardProps) => {
  const stages = applicationsByStage.filter((item) => item.value > 0);
  const maxValue = Math.max(...stages.map((stage) => stage.value), 1);

  return (
    <Card className="flex h-full min-w-0 flex-col">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-3">
        <CardTitle className="text-base">Pipeline</CardTitle>
        <Button asChild variant="outline" size="sm">
          <Link href="/pipeline">Ver pipeline</Link>
        </Button>
      </CardHeader>
      <CardContent className="flex-1">
        {stages.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <GitBranch className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">Nenhum processo ativo ainda.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/pipeline">Ir para pipeline</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {stages.map((stage) => (
              <li key={stage.label} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="truncate font-medium text-foreground">{stage.label}</span>
                  <span className="shrink-0 text-muted-foreground">{stage.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(stage.value / maxValue) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
