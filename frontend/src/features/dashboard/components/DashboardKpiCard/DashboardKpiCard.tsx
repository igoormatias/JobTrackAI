"use client";

import { memo } from "react";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

import { KPI_CONFIG } from "../../constants/kpi-config";
import type { DashboardKpiCardProps } from "../../types";

export const DashboardKpiCard = memo(({ kpi }: DashboardKpiCardProps) => {
  const config = KPI_CONFIG[kpi.id];
  const Icon = config?.icon;

  return (
    <Card className="border-border/60 bg-card/80">
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
            <p
              className="text-2xl font-bold text-foreground lg:text-3xl"
              aria-label={`${kpi.label}: ${kpi.value}. Variação: +${kpi.change} ${kpi.changeLabel}`}
            >
              {kpi.value}
            </p>
            <p className="text-xs text-primary">
              +{kpi.change} {kpi.changeLabel}
            </p>
            {config?.description ? (
              <p className="text-xs text-muted-foreground">{config.description}</p>
            ) : null}
          </div>
          {Icon ? (
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10")}>
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
});

DashboardKpiCard.displayName = "DashboardKpiCard";
