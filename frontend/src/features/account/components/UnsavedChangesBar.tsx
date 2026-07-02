"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export type UnsavedChangesBarProps = {
  visible: boolean;
  isSaving?: boolean;
  onDiscard: () => void;
  onSave: () => void;
  className?: string;
};

export const UnsavedChangesBar = ({
  visible,
  isSaving = false,
  onDiscard,
  onSave,
  className,
}: UnsavedChangesBarProps) => {
  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-16 left-0 right-0 z-40 border-t border-border bg-card/95 px-4 py-3 backdrop-blur lg:bottom-0",
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Você tem alterações não salvas</p>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onDiscard} disabled={isSaving}>
            Descartar
          </Button>
          <Button type="button" size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
};
