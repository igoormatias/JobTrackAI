import type { DashboardKpi, DashboardInsight } from "@/types";

export type DashboardKpiCardProps = {
  kpi: DashboardKpi;
};

export type DashboardInsightCardProps = {
  insight: DashboardInsight;
};

export type DashboardSectionProps = {
  className?: string;
};
