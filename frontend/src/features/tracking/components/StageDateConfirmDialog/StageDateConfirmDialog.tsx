"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
} from "@/components/ui/Modal";

export type StageDateConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (occurredAt: string) => void;
  isPending?: boolean;
};

export const StageDateConfirmDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: StageDateConfirmDialogProps) => {
  const [useCustomDate, setUseCustomDate] = useState(false);
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().slice(0, 16));

  const handleConfirmCurrent = () => {
    onConfirm(new Date().toISOString());
    onOpenChange(false);
  };

  const handleConfirmCustom = () => {
    onConfirm(new Date(customDate).toISOString());
    onOpenChange(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Data da movimentação</ModalTitle>
        </ModalHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Deseja utilizar a data atual para este status?</p>

          {!useCustomDate ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleConfirmCurrent} disabled={isPending}>
                Sim, usar data atual
              </Button>
              <Button type="button" variant="outline" onClick={() => setUseCustomDate(true)}>
                Editar data
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="stage-custom-date">Data do status</Label>
                <Input
                  id="stage-custom-date"
                  type="datetime-local"
                  value={customDate}
                  onChange={(event) => setCustomDate(event.target.value)}
                />
              </div>
              <Button type="button" onClick={handleConfirmCustom} disabled={isPending}>
                Confirmar data
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};
