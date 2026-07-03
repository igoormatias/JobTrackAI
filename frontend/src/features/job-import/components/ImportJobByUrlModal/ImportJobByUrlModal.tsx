"use client";

import { Link2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";

import {
  useConfirmJobImportMutation,
  usePreviewJobImportMutation,
} from "../../hooks/use-job-import-mutation";
import type { JobImportPreview } from "../../services/job-import-service";

export type ImportJobByUrlModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultAddToPipeline?: boolean;
  onSuccess?: () => void;
};

export const ImportJobByUrlModal = ({
  open,
  onOpenChange,
  defaultAddToPipeline = false,
  onSuccess,
}: ImportJobByUrlModalProps) => {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<JobImportPreview | null>(null);
  const [addToPipeline, setAddToPipeline] = useState(defaultAddToPipeline);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const previewMutation = usePreviewJobImportMutation();
  const confirmMutation = useConfirmJobImportMutation();

  useEffect(() => {
    if (!open) return;
    setUrl("");
    setPreview(null);
    setErrorMessage(null);
    setAddToPipeline(defaultAddToPipeline);
  }, [open, defaultAddToPipeline]);

  const handlePreview = () => {
    setErrorMessage(null);
    setPreview(null);
    previewMutation.mutate(url.trim(), {
      onSuccess: (data) => setPreview(data),
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "URL inválida ou fonte não suportada.";
        setErrorMessage(message);
      },
    });
  };

  const handleConfirm = () => {
    if (!preview) return;

    confirmMutation.mutate(
      { url: url.trim(), addToPipeline },
      {
        onSuccess: () => {
          onOpenChange(false);
          onSuccess?.();
        },
      },
    );
  };

  const isBusy = previewMutation.isPending || confirmMutation.isPending;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent className="max-w-lg">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2">
            <Link2 className="size-5" aria-hidden />
            Importar vaga por URL
          </ModalTitle>
          <ModalDescription>
            Cole o link da vaga no Gupy para visualizar e importar para o JobTrack AI.
          </ModalDescription>
        </ModalHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-import-url">URL da vaga</Label>
            <Input
              id="job-import-url"
              type="url"
              placeholder="https://portal.gupy.io/job/12345"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={isBusy}
            />
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          {preview ? (
            <div className="space-y-3">
              {preview.warnings?.map((warning) => (
                <p
                  key={warning}
                  className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-800 dark:text-amber-200"
                  role="status"
                >
                  {warning}
                </p>
              ))}
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <p className="font-semibold text-foreground">{preview.title}</p>
              <p className="text-muted-foreground">{preview.company}</p>
              {preview.location ? (
                <p className="mt-1 text-muted-foreground">{preview.location}</p>
              ) : null}
              {preview.modality ? (
                <p className="text-muted-foreground capitalize">{preview.modality}</p>
              ) : null}
              <p className="mt-2 line-clamp-3 text-muted-foreground">{preview.description}</p>
            </div>
            </div>
          ) : null}

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              className="size-4 rounded border-border"
              checked={addToPipeline}
              onChange={(event) => setAddToPipeline(event.target.checked)}
              disabled={isBusy}
            />
            Adicionar ao pipeline após importar
          </label>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isBusy}>
              Cancelar
            </Button>
            <Button type="button" variant="secondary" onClick={handlePreview} disabled={!url.trim() || isBusy}>
              {previewMutation.isPending ? "Analisando..." : "Visualizar"}
            </Button>
            <Button type="button" onClick={handleConfirm} disabled={!preview || isBusy}>
              {confirmMutation.isPending ? "Importando..." : "Confirmar importação"}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
};
