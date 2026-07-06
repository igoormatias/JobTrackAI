"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { invalidateCareerSurfaces } from "@/lib/query-client/invalidate-career-surfaces";
import { queryKeys } from "@/lib/query-client/query-keys";

import {
  confirmJobImport,
  previewJobImport,
  type ConfirmJobImportPayload,
} from "../services/job-import-service";

export const usePreviewJobImportMutation = () =>
  useMutation({
    mutationFn: (url: string) => previewJobImport(url),
    onError: () => toast.error("Não foi possível analisar a URL da vaga"),
  });

export const useConfirmJobImportMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ConfirmJobImportPayload) => confirmJobImport(payload),
    onSuccess: async (_data, variables) => {
      invalidateCareerSurfaces(queryClient);
      if (variables.addToPipeline) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      }
      toast.success(
        _data.isExisting
          ? "Vaga já existente — redirecionando para detalhes"
          : variables.addToPipeline
            ? "Vaga importada e adicionada ao pipeline"
            : "Vaga importada com sucesso",
      );
    },
    onError: () => toast.error("Não foi possível importar a vaga"),
  });
};
