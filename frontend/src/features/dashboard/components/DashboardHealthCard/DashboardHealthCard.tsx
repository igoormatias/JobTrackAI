"use client";

import { Activity } from "lucide-react";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Muted } from "@/components/typography";
import type { DashboardProviderHealth } from "@/types";

type DashboardHealthCardProps = {
  providerHealth: DashboardProviderHealth[];
};

const STATUS_LABELS: Record<string, string> = {
  healthy: "Saudável",
  degraded: "Em execução",
  unhealthy: "Com falha",
  disabled: "Desativado",
  unknown: "Sem dados",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline" | "warning"> = {
  healthy: "default",
  degraded: "secondary",
  unhealthy: "warning",
  disabled: "outline",
  unknown: "outline",
};

export const DashboardHealthCard = ({ providerHealth }: DashboardHealthCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
      <Activity className="h-4 w-4 text-muted-foreground" />
      <CardTitle className="text-base">Saúde dos providers</CardTitle>
    </CardHeader>
    <CardContent>
      {providerHealth.length === 0 ? (
        <Muted>Nenhum provider configurado.</Muted>
      ) : (
        <ul className="space-y-2">
          {providerHealth.map((item) => (
            <li
              key={item.provider}
              className="flex items-center justify-between gap-2 rounded-md border border-border/60 p-2 text-sm"
            >
              <span className="font-medium">{item.displayName}</span>
              <Badge variant={STATUS_VARIANT[item.status] ?? "outline"}>
                {STATUS_LABELS[item.status] ?? item.status}
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
