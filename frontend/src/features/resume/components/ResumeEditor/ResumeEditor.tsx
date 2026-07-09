"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { SkillsSelector } from "@/components/data-display/SkillsSelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

import { useUpdateResumeMutation } from "../../hooks/use-resume-queries";
import {
  EMPTY_RESUME_CONTENT,
  type ResumeStructuredContent,
} from "../../services/resume-service";
import { ResumeCopyActions } from "../ResumeCopyActions/ResumeCopyActions";
import { RichTextEditor } from "../RichTextEditor/RichTextEditor";

export type ResumeEditorProps = {
  initialContent?: ResumeStructuredContent | null;
  autoSaveMs?: number;
};

export const ResumeEditor = ({ initialContent, autoSaveMs = 3000 }: ResumeEditorProps) => {
  const [content, setContent] = useState<ResumeStructuredContent>(
    initialContent ?? EMPTY_RESUME_CONTENT,
  );
  const [dirty, setDirty] = useState(false);
  const updateMutation = useUpdateResumeMutation();

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
      setDirty(false);
    }
  }, [initialContent]);

  const save = useCallback(() => {
    updateMutation.mutate(content, {
      onSuccess: () => {
        setDirty(false);
        toast.success("Currículo salvo");
      },
      onError: () => toast.error("Erro ao salvar currículo"),
    });
  }, [content, updateMutation]);

  useEffect(() => {
    if (!dirty || autoSaveMs <= 0) return;
    const timer = setTimeout(save, autoSaveMs);
    return () => clearTimeout(timer);
  }, [content, dirty, autoSaveMs, save]);

  const updateField = <K extends keyof ResumeStructuredContent>(
    key: K,
    value: ResumeStructuredContent[K],
  ) => {
    setContent((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-foreground">Editor</h3>
          <div className="flex gap-2">
            {dirty ? (
              <span className="text-xs text-muted-foreground">Alterações não salvas</span>
            ) : null}
            <Button type="button" onClick={save} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume-name">Nome</Label>
          <Input
            id="resume-name"
            value={content.fullName ?? ""}
            onChange={(e) => updateField("fullName", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Resumo profissional</Label>
          <RichTextEditor
            value={content.professionalSummary}
            onChange={(value) => updateField("professionalSummary", value)}
          />
        </div>

        {content.experiences.map((exp, index) => (
          <div key={`exp-${index}`} className="space-y-2 rounded-md border border-border p-3">
            <Label>{`Experiência ${index + 1}`}</Label>
            <Input
              value={exp.role}
              placeholder="Cargo"
              onChange={(e) => {
                const experiences = [...content.experiences];
                experiences[index] = { ...exp, role: e.target.value };
                updateField("experiences", experiences);
              }}
            />
            <Input
              value={exp.company}
              placeholder="Empresa"
              onChange={(e) => {
                const experiences = [...content.experiences];
                experiences[index] = { ...exp, company: e.target.value };
                updateField("experiences", experiences);
              }}
            />
            <RichTextEditor
              value={exp.description}
              onChange={(value) => {
                const experiences = [...content.experiences];
                experiences[index] = { ...exp, description: value };
                updateField("experiences", experiences);
              }}
            />
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            updateField("experiences", [
              ...content.experiences,
              { company: "", role: "", description: "", technologies: [] },
            ])
          }
        >
          Adicionar experiência
        </Button>

        <SkillsSelector
          id="hard-skills"
          label="Hard skills"
          helpText="Adicione suas competências técnicas. Pressione Enter para criar cada chip."
          placeholder="Ex.: React, TypeScript, Node.js..."
          value={content.hardSkills}
          onChange={(skills) => updateField("hardSkills", skills)}
          useApiSuggestions
        />

        <ResumeCopyActions content={content} />
      </div>

      <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-4">
        <h3 className="font-semibold text-foreground">Preview</h3>
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
          {content.fullName ? <p className="font-bold">{content.fullName}</p> : null}
          {content.professionalSummary ? (
            <>
              <h4>Resumo</h4>
              <p>{content.professionalSummary}</p>
            </>
          ) : null}
          {content.experiences.length ? (
            <>
              <h4>Experiências</h4>
              {content.experiences.map((exp, i) => (
                <div key={i}>
                  <p className="font-medium">
                    {exp.role} — {exp.company}
                  </p>
                  <p>{exp.description}</p>
                </div>
              ))}
            </>
          ) : null}
          {content.hardSkills.length ? (
            <>
              <h4>Skills</h4>
              <p>{content.hardSkills.join(", ")}</p>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
