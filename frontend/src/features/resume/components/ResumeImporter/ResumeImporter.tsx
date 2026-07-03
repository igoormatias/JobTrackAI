"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

import {
  useImportResumeTextMutation,
  useUploadResumeMutation,
} from "../../hooks/use-resume-queries";

export type ResumeImporterProps = {
  onSuccess?: () => void;
};

export const ResumeImporter = ({ onSuccess }: ResumeImporterProps) => {
  const [pasteText, setPasteText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadResumeMutation();
  const importMutation = useImportResumeTextMutation();
  const isBusy = uploadMutation.isPending || importMutation.isPending;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    uploadMutation.mutate(file, {
      onSuccess: () => {
        toast.success("Currículo importado com sucesso");
        onSuccess?.();
      },
      onError: () => toast.error("Falha ao importar arquivo"),
    });
  };

  const handlePaste = () => {
    if (pasteText.trim().length < 10) {
      toast.error("Cole um texto maior para importar");
      return;
    }
    importMutation.mutate(pasteText.trim(), {
      onSuccess: () => {
        toast.success("Texto importado e estruturado");
        setPasteText("");
        onSuccess?.();
      },
      onError: () => toast.error("Falha ao importar texto"),
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
      <div>
        <Label>Upload (PDF, DOCX ou TXT)</Label>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,text/plain"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <Button
            type="button"
            variant="secondary"
            disabled={isBusy}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mr-2 size-4" aria-hidden />
            {uploadMutation.isPending ? "Importando..." : "Selecionar arquivo"}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="resume-paste">Ou cole seu currículo</Label>
        <Textarea
          id="resume-paste"
          rows={6}
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Cole o conteúdo do currículo aqui..."
          disabled={isBusy}
        />
        <Button type="button" onClick={handlePaste} disabled={isBusy || !pasteText.trim()}>
          {importMutation.isPending ? "Estruturando..." : "Importar texto"}
        </Button>
      </div>
    </div>
  );
};
