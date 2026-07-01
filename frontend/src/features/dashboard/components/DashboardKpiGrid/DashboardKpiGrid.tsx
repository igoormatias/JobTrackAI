"use client";

import type { DashboardKpi } from "@/types";

import { DASHBOARD_LAYOUT } from "../../constants/dashboard-layout";
import { DashboardKpiCard } from "../DashboardKpiCard";

export type DashboardKpiGridProps = {
  kpis: DashboardKpi[];
};

export const DashboardKpiGrid = ({ kpis }: DashboardKpiGridProps) => (
  <section aria-label="Indicadores" className={DASHBOARD_LAYOUT.kpiGrid}>
    {kpis.map((kpi) => (
      <DashboardKpiCard key={kpi.id} kpi={kpi} />
    ))}
  </section>
);
