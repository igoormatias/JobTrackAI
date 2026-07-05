"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { RefreshCw } from "lucide-react";

import { REFRESH_FREQUENCY_OPTIONS } from "@/features/account/constants/settings-options";
import { useSettingsQuery } from "@/features/account/queries";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Muted } from "@/components/typography";
import type { DashboardJobSync } from "@/types";

import { useProviderSyncMutation } from "../../hooks/use-provider-sync";

type DashboardJobSyncCardProps = {
  jobSync: DashboardJobSync;
};

const formatRelativeSync = (value: string | null): string => {
  if (!value) return "Nunca";
  return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR });
};

const EXECUTION_STATUS_LABELS: Record<string, string> = {
  completed: "OK",
  failed: "Falha",
  running: "Executando",
};

const getProviderStatus = (
  provider: string,
  executions: DashboardJobSync["recentExecutions"],
): string | null => {
  const latest = executions.find((execution) => execution.providerName === provider);
  return latest?.status ?? null;
};

export const DashboardJobSyncCard = ({ jobSync }: DashboardJobSyncCardProps) => {
  const { data: settings } = useSettingsQuery();
  const syncMutation = useProviderSyncMutation();
  const autoSyncLabel = REFRESH_FREQUENCY_OPTIONS.find(
    (option) => option.value === settings?.jobRefreshFrequency,
  )?.label;

  return (
  <Card>
    <CardHeader className="flex flex-row items-center gap-2 space-y-0">
      <RefreshCw className="h-4 w-4 text-muted-foreground" />
      <CardTitle className="text-base">Sincronização de vagas</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Muted>Última sync</Muted>
          <p className="text-sm font-medium">{formatRelativeSync(jobSync.lastSyncAt)}</p>
        </div>
        <div>
          <Muted>Total no catálogo</Muted>
          <p className="text-sm font-medium">{jobSync.totalCatalogJobs}</p>
        </div>
        {jobSync.newJobsSinceLastSync > 0 ? (
          <div>
            <Muted>Novas desde a sync</Muted>
            <p className="text-sm font-medium text-primary">+{jobSync.newJobsSinceLastSync}</p>
          </div>
        ) : null}
      </div>

      {jobSync.jobsByProvider.length > 0 ? (
        <div className="space-y-2">
          <Muted>Por provider</Muted>
          <ul className="space-y-1 text-sm">
            {jobSync.jobsByProvider.map((item) => {
              const status = getProviderStatus(item.provider, jobSync.recentExecutions);
              return (
                <li key={item.provider} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 capitalize">
                    {item.provider}
                    {status ? (
                      <Badge variant={status === "failed" ? "warning" : "secondary"} className="text-xs">
                        {EXECUTION_STATUS_LABELS[status] ?? status}
                      </Badge>
                    ) : null}
                  </span>
                  <span className="font-medium">{item.count}</span>
                </li>
              );
            })}
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
                  <span className="font-medium capitalize">{execution.providerName}</span>
                  <span>{EXECUTION_STATUS_LABELS[execution.status] ?? execution.status}</span>
                </div>
                <Muted>
                  +{execution.importedCount} importadas · {execution.duplicateCount} duplicadas
                </Muted>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => syncMutation.mutate()}
          disabled={syncMutation.isPending}
          isLoading={syncMutation.isPending}
        >
          <RefreshCw className="h-4 w-4" aria-hidden />
          Sincronizar agora
        </Button>
        {settings?.jobRefreshFrequency && settings.jobRefreshFrequency !== "manual" && autoSyncLabel ? (
          <Muted>Auto-sync: {autoSyncLabel.toLowerCase()}</Muted>
        ) : null}
      </div>
    </CardContent>
  </Card>
  );
};
