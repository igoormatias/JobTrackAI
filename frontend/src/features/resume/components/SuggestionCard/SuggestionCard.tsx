"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

import {
  useApplySuggestionMutation,
  useRejectSuggestionMutation,
} from "../../hooks/use-resume-queries";
import type { ResumeSuggestion } from "../../services/resume-service";

export type SuggestionCardProps = {
  suggestion: ResumeSuggestion;
  onApplied?: () => void;
};

export const SuggestionCard = ({ suggestion, onApplied }: SuggestionCardProps) => {
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestion.suggestedText);
  const applyMutation = useApplySuggestionMutation();
  const rejectMutation = useRejectSuggestionMutation();
  const isBusy = applyMutation.isPending || rejectMutation.isPending;

  const handleApply = () => {
    applyMutation.mutate(
      { id: suggestion.id, editedText: editing ? editedText : undefined },
      {
        onSuccess: () => {
          toast.success("Sugestão aplicada — revise e salve no editor");
          setEditing(false);
          onApplied?.();
        },
        onError: () => toast.error("Erro ao aplicar sugestão"),
      },
    );
  };

  const handleReject = () => {
    rejectMutation.mutate(suggestion.id, {
      onSuccess: () => toast.success("Sugestão rejeitada"),
      onError: () => toast.error("Erro ao rejeitar"),
    });
  };

  if (suggestion.status !== "pending") {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 opacity-70">
        <p className="text-sm font-medium capitalize">{suggestion.section}</p>
        <p className="text-xs text-muted-foreground">Status: {suggestion.status}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div>
        <p className="font-medium text-foreground capitalize">{suggestion.section}</p>
        <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
        <p className="text-xs text-primary">Impacto: {suggestion.impact}</p>
      </div>

      {editing ? (
        <Textarea value={editedText} onChange={(e) => setEditedText(e.target.value)} rows={4} />
      ) : (
        <p className="rounded bg-muted/50 p-2 text-sm">{suggestion.suggestedText}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={handleApply} disabled={isBusy}>
          Aceitar
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => setEditing((v) => !v)}
          disabled={isBusy}
        >
          Editar
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={handleReject} disabled={isBusy}>
          Ignorar
        </Button>
      </div>
    </div>
  );
};
