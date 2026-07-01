"use client";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardChartPoint } from "@/types";

export type DashboardTechnologiesCardProps = {
  technologies: DashboardChartPoint[];
};

export const DashboardTechnologiesCard = ({ technologies }: DashboardTechnologiesCardProps) => {
  const maxValue = Math.max(...technologies.map((item) => item.value), 1);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Competências mais encontradas</CardTitle>
      </CardHeader>
      <CardContent>
        {technologies.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma competência destacada.</p>
        ) : (
          <div className="space-y-3">
            {technologies.map((tech) => (
              <div key={tech.label} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline">{tech.label}</Badge>
                  <span className="text-xs text-muted-foreground">{tech.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(tech.value / maxValue) * 100}%` }}
                    role="presentation"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
