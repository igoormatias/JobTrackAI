"use client";

import { Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import type { DashboardInsightCardProps } from "../../types";

export const DashboardInsightCard = ({ insight }: DashboardInsightCardProps) => (
  <Card className="h-full border-primary/20 bg-primary/5">
    <CardHeader className="pb-2">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
        <CardTitle className="text-base">{insight.title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm leading-relaxed text-muted-foreground">{insight.message}</p>
      {insight.trendPercent !== undefined ? (
        <p
          className={`mt-3 text-xs font-medium ${insight.trendPercent >= 0 ? "text-primary" : "text-destructive"}`}
        >
          {insight.trendPercent >= 0 ? "+" : ""}
          {insight.trendPercent}% esta semana
        </p>
      ) : null}
    </CardContent>
  </Card>
);
