"use client";

import { RefreshCw } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Muted } from "@/components/typography";
import type { DashboardJobSync } from "@/types";

type DashboardJobSyncCardProps = {
  jobSync: DashboardJobSync;
};

const formatDate = (value: string | null): string => {
  if (!value) return "Nunca";
  return new Date(value).toLocaleString("pt-BR");
};

export const DashboardJobSyncCard = ({ jobSync }: DashboardJobSyncCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
      <RefreshCw className="h-4 w-4 text-muted-foreground" />
      <CardTitle className="text-base">Sincronização de vagas</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Muted>Última sync</Muted>
          <p className="text-sm font-medium">{formatDate(jobSync.lastSyncAt)}</p>
        </div>
        <div>
          <Muted>Total no catálogo</Muted>
          <p className="text-sm font-medium">{jobSync.totalCatalogJobs}</p>
        </div>
      </div>

      {jobSync.jobsByProvider.length > 0 ? (
        <div className="space-y-2">
          <Muted>Por provider</Muted>
          <ul className="space-y-1 text-sm">
            {jobSync.jobsByProvider.map((item) => (
              <li key={item.provider} className="flex justify-between gap-2">
                <span className="capitalize">{item.provider}</span>
                <span className="font-medium">{item.count}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Muted>Nenhuma vaga importada ainda.</Muted>
      )}

      {jobSync.providerErrors24h > 0 ? (
        <p className="text-sm text-destructive">
          {jobSync.providerErrors24h} falha(s) de sync nas últimas 24h
        </p>
      ) : null}

      {jobSync.recentExecutions.length > 0 ? (
        <div className="space-y-2">
          <Muted>Execuções recentes</Muted>
          <ul className="space-y-2 text-sm">
            {jobSync.recentExecutions.slice(0, 3).map((execution) => (
              <li key={execution.id} className="rounded-md border border-border/60 p-2">
                <div className="flex justify-between gap-2">
                  <span className="capitalize font-medium">{execution.providerName}</span>
                  <span>{execution.status}</span>
                </div>
                <Muted>
                  +{execution.importedCount} importadas · {execution.duplicateCount} duplicadas
                </Muted>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </CardContent>
  </Card>
);
