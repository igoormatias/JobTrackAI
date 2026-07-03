"use client";

import { useEffect, useState } from "react";

import { Label } from "@/components/ui/Label";

import { ResumeSectionLayout } from "../../components/ResumeSectionLayout/ResumeSectionLayout";

const STORAGE_KEY = "jobtrack-resume-autosave-ms";

export const ResumeSettingsPage = () => {
  const [autoSaveMs, setAutoSaveMs] = useState(3000);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setAutoSaveMs(Number(stored));
  }, []);

  const handleChange = (value: number) => {
    setAutoSaveMs(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  };

  return (
    <ResumeSectionLayout title="Configurações" description="Preferências do Currículo Inteligente.">
      <div className="max-w-md space-y-4 rounded-lg border border-border p-4">
        <div className="space-y-2">
          <Label htmlFor="autosave">Auto-save (segundos)</Label>
          <select
            id="autosave"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={autoSaveMs}
            onChange={(e) => handleChange(Number(e.target.value))}
          >
            <option value={0}>Desativado</option>
            <option value={2000}>2 segundos</option>
            <option value={3000}>3 segundos</option>
            <option value={5000}>5 segundos</option>
          </select>
        </div>
        <p className="text-xs text-muted-foreground">
          Skills do currículo são normalizadas pelo catálogo oficial. Sincronização com perfil requer
          confirmação manual (em breve).
        </p>
      </div>
    </ResumeSectionLayout>
  );
};

export const getResumeAutoSaveMs = (): number => {
  if (typeof window === "undefined") return 3000;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? Number(stored) : 3000;
};
