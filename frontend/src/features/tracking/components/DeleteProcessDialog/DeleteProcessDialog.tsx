"use client";

import { Button } from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";
import type { Application } from "@/types";

export type DeleteProcessDialogProps = {
  application: Application | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
};

export const DeleteProcessDialog = ({
  application,
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: DeleteProcessDialogProps) => (
  <Modal open={open} onOpenChange={onOpenChange}>
    <ModalContent className="max-w-md">
      <ModalHeader>
        <ModalTitle>Excluir processo?</ModalTitle>
        <ModalDescription>
          {application
            ? `O processo "${application.job.title}" em ${application.job.company.name} será removido do seu pipeline. A vaga no catálogo não é apagada.`
            : "Este processo será removido do seu pipeline."}
        </ModalDescription>
      </ModalHeader>
      <ModalFooter className="gap-2 sm:justify-end">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="button" variant="destructive" onClick={onConfirm} disabled={isPending}>
          {isPending ? "Excluindo…" : "Excluir processo"}
        </Button>
      </ModalFooter>
    </ModalContent>
  </Modal>
);
