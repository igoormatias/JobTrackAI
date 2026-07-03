"use client";

import { Copy, FileText } from "lucide-react";

import { Button } from "@/components/ui/Button";

import {
  formatResumeAsText,
  type ResumeStructuredContent,
} from "../../services/resume-service";

export type ResumeCopyActionsProps = {
  content: ResumeStructuredContent;
};

const copy = async (text: string) => {
  await navigator.clipboard.writeText(text);
};

export const ResumeCopyActions = ({ content }: ResumeCopyActionsProps) => (
  <div className="flex flex-wrap gap-2">
    <Button type="button" variant="outline" size="sm" onClick={() => void copy(formatResumeAsText(content))}>
      <Copy className="mr-1 size-4" aria-hidden />
      Copiar currículo
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void copy(content.professionalSummary)}
    >
      <FileText className="mr-1 size-4" aria-hidden />
      Copiar resumo
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() =>
        void copy(
          content.experiences
            .map((e) => `${e.role} — ${e.company}\n${e.description}`)
            .join("\n\n"),
        )
      }
    >
      Copiar experiências
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void copy(content.hardSkills.join(", "))}
    >
      Copiar skills
    </Button>
  </div>
);
