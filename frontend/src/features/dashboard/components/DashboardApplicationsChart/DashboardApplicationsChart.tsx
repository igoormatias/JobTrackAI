"use client";

import dynamic from "next/dynamic";

import { Skeleton } from "@/components/feedback/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardChartPoint } from "@/types";

const DashboardApplicationsChartInner = dynamic(
  () =>
    import("./DashboardApplicationsChartInner").then((mod) => mod.DashboardApplicationsChartInner),
  {
    ssr: false,
    loading: () => <Skeleton className="h-64 w-full" aria-hidden="true" />,
  },
);

export type DashboardApplicationsChartProps = {
  data: DashboardChartPoint[];
};

export const DashboardApplicationsChart = ({ data }: DashboardApplicationsChartProps) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-base">Aplicações por período</CardTitle>
    </CardHeader>
    <CardContent className="min-w-0">
      <DashboardApplicationsChartInner data={data} />
    </CardContent>
  </Card>
);
