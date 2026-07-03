"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/feedback/Spinner";

import {
  useRestoreVersionMutation,
  useResumeVersionsQuery,
} from "../../hooks/use-resume-queries";

export const VersionHistory = () => {
  const { data: versions, isLoading } = useResumeVersionsQuery();
  const restoreMutation = useRestoreVersionMutation();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!versions?.length) {
    return <p className="text-sm text-muted-foreground">Nenhuma versão salva ainda.</p>;
  }

  return (
    <ul className="space-y-3">
      {versions.map((version) => (
        <li
          key={version.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3"
        >
          <div>
            <p className="font-medium">Versão {version.versionNumber}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {version.source} ·{" "}
              {format(new Date(version.createdAt), "dd MMM yyyy HH:mm", { locale: ptBR })}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={restoreMutation.isPending}
            onClick={() =>
              restoreMutation.mutate(version.id, {
                onSuccess: () => toast.success("Versão restaurada"),
                onError: () => toast.error("Erro ao restaurar versão"),
              })
            }
          >
            Restaurar
          </Button>
        </li>
      ))}
    </ul>
  );
};
