import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Job } from "@/types";

import { buildDescriptionSections } from "../../utils/description-sections";
import { JobDetailsEmptySection } from "../JobDetailsEmptySection";

export type JobDescriptionCardProps = {
  job: Job;
};

export const JobDescriptionCard = ({ job }: JobDescriptionCardProps) => {
  const sections = buildDescriptionSections(job);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sobre a vaga</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {sections.summary ? (
          <p className="text-sm text-muted-foreground">{sections.summary}</p>
        ) : (
          <JobDetailsEmptySection message="Sem resumo disponível para esta vaga." />
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Descrição completa</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-line">{sections.fullDescription}</p>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Requisitos</h4>
          {sections.requirements.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {sections.requirements.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <JobDetailsEmptySection message="Sem requisitos informados." />
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Desejáveis</h4>
          {sections.desirable.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {sections.desirable.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <JobDetailsEmptySection message="Sem diferenciais informados." />
          )}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Benefícios</h4>
          {sections.benefits.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {sections.benefits.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <JobDetailsEmptySection message="Sem benefícios informados." />
          )}
        </div>

        {sections.additionalInfo ? (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Informações adicionais</h4>
            <p className="text-sm text-muted-foreground">{sections.additionalInfo}</p>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
