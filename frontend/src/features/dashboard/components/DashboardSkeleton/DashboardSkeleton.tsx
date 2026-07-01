"use client";

import { Skeleton } from "@/components/feedback/Skeleton";

import { DASHBOARD_LAYOUT } from "../../constants/dashboard-layout";

export const DashboardSkeleton = () => (
  <div className={DASHBOARD_LAYOUT.page} aria-busy="true" aria-label="Carregando dashboard">
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-80" />
    </div>

    <div className={DASHBOARD_LAYOUT.kpiGrid}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full rounded-xl" />
      ))}
    </div>

    <div className={DASHBOARD_LAYOUT.grid}>
      <Skeleton className={`h-48 ${DASHBOARD_LAYOUT.insight}`} />
      <Skeleton className={`h-64 ${DASHBOARD_LAYOUT.chart}`} />
      <Skeleton className={`h-80 ${DASHBOARD_LAYOUT.topJobs}`} />
      <Skeleton className={`h-80 ${DASHBOARD_LAYOUT.interviews}`} />
      <Skeleton className={`h-72 ${DASHBOARD_LAYOUT.timeline}`} />
      <Skeleton className={`h-56 ${DASHBOARD_LAYOUT.companies}`} />
      <Skeleton className={`h-56 ${DASHBOARD_LAYOUT.technologies}`} />
    </div>
  </div>
);
