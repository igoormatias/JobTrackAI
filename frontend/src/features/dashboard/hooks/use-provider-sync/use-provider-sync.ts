"use client";

import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useSettingsQuery } from "@/features/account/queries";
import { invalidateCareerSurfaces } from "@/lib/query-client/invalidate-career-surfaces";
import { queryKeys } from "@/lib/query-client/query-keys";
import { resolveRefreshIntervalMs } from "@/lib/refresh-frequency";

import { runProviderSync } from "../../services/provider-service";

type UseProviderSyncMutationOptions = {
  silent?: boolean;
};

const invalidateAfterSync = (queryClient: ReturnType<typeof useQueryClient>): void => {
  invalidateCareerSurfaces(queryClient);
  void queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all });
};

const summarizeSync = (executions: Awaited<ReturnType<typeof runProviderSync>>): string => {
  const imported = executions.reduce((sum, item) => sum + item.execution.importedCount, 0);
  const failed = executions.filter((item) => item.execution.status === "failed").length;

  if (failed > 0) {
    return `Sync concluída com ${failed} falha(s). ${imported} vaga(s) importada(s).`;
  }

  if (imported > 0) {
    return `${imported} nova(s) vaga(s) importada(s).`;
  }

  return "Sincronização concluída. Nenhuma vaga nova.";
};

export const useProviderSyncMutation = (options: UseProviderSyncMutationOptions = {}) => {
  const queryClient = useQueryClient();
  const { silent = false } = options;

  return useMutation({
    mutationFn: runProviderSync,
    onSuccess: (executions) => {
      invalidateAfterSync(queryClient);
      if (!silent) {
        toast.success(summarizeSync(executions));
      }
    },
    onError: () => {
      if (!silent) {
        toast.error("Não foi possível sincronizar as vagas. Tente novamente.");
      }
    },
  });
};

export const useProviderAutoSync = (): void => {
  const { data: settings } = useSettingsQuery();
  const syncMutation = useProviderSyncMutation({ silent: true });
  const isPendingRef = useRef(false);
  const mutateRef = useRef(syncMutation.mutate);

  isPendingRef.current = syncMutation.isPending;
  mutateRef.current = syncMutation.mutate;

  useEffect(() => {
    const intervalMs = resolveRefreshIntervalMs(settings?.jobRefreshFrequency);
    if (!intervalMs) return;

    const id = window.setInterval(() => {
      if (isPendingRef.current) return;
      mutateRef.current();
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [settings?.jobRefreshFrequency]);
};
