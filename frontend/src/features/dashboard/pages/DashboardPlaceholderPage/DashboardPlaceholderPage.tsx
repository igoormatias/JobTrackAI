"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Muted } from "@/components/typography";

import { useDashboard } from "../../hooks/use-dashboard";

export const DashboardPlaceholderPage = () => {
  const { data, isLoading, isError } = useDashboard();

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão geral da sua jornada de carreira." />

      {isLoading ? <Muted>Carregando dashboard personalizado...</Muted> : null}
      {isError ? <Muted>Não foi possível carregar o dashboard.</Muted> : null}

      {data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  +{kpi.change} {kpi.changeLabel}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {data?.recentActivities.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Activity Center</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.recentActivities.map((activity) => (
              <div key={activity.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                <p className="font-medium">{activity.title}</p>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};
