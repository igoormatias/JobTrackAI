"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { sanitizeJobDescriptionHtml } from "@/lib/sanitize-html";
import type { Job } from "@/types";

import { buildDescriptionSections } from "../../utils/description-sections";
import { JobDetailsEmptySection } from "../JobDetailsEmptySection";

export type JobDescriptionCardProps = {
  job: Job;
};

const COLLAPSE_THRESHOLD = 900;

const SectionList = ({ title, items }: { title: string; items: string[] }) => {
  if (items.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">{title}</h4>
      <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export const JobDescriptionCard = ({ job }: JobDescriptionCardProps) => {
  const sections = buildDescriptionSections(job);
  const [expanded, setExpanded] = useState(false);

  const htmlContent = useMemo(() => {
    if (job.descriptionHtml?.trim()) return sanitizeJobDescriptionHtml(job.descriptionHtml);
    return null;
  }, [job.descriptionHtml]);

  const plainLength = htmlContent?.replace(/<[^>]+>/g, "").length ?? sections.fullDescription.length;
  const needsCollapse = plainLength > COLLAPSE_THRESHOLD;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sobre a vaga</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.summary ? (
          <p className="text-sm text-muted-foreground">{sections.summary}</p>
        ) : null}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Descrição completa</h4>
          {htmlContent || sections.fullDescription ? (
            <div
              className={
                needsCollapse && !expanded
                  ? "relative max-h-72 overflow-hidden"
                  : needsCollapse
                    ? "max-h-[32rem] overflow-y-auto scrollbar-app"
                    : undefined
              }
            >
              {htmlContent ? (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none text-sm text-muted-foreground [&_li]:my-0.5 [&_p]:my-2 [&_ul]:my-2"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
              ) : (
                <p className="whitespace-pre-line text-sm text-muted-foreground">{sections.fullDescription}</p>
              )}
              {needsCollapse && !expanded ? (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card to-transparent" />
              ) : null}
            </div>
          ) : (
            <JobDetailsEmptySection message="Sem descrição disponível para esta vaga." />
          )}
          {needsCollapse ? (
            <Button type="button" variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)}>
              {expanded ? "Recolher" : "Expandir"}
            </Button>
          ) : null}
        </div>

        <SectionList title="Requisitos" items={sections.requirements} />
        <SectionList title="Responsabilidades" items={sections.responsibilities} />
        <SectionList title="Desejáveis" items={sections.desirable} />
        <SectionList title="Benefícios" items={sections.benefits} />
      </CardContent>
    </Card>
  );
};
