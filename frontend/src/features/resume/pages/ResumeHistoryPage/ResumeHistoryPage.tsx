"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Spinner } from "@/components/feedback/Spinner";

import { ResumeSectionLayout } from "../../components/ResumeSectionLayout/ResumeSectionLayout";
import { VersionHistory } from "../../components/VersionHistory/VersionHistory";
import { useResumeHistoryQuery } from "../../hooks/use-resume-queries";

export const ResumeHistoryPage = () => {
  const { data, isLoading } = useResumeHistoryQuery();

  return (
    <ResumeSectionLayout title="Histórico" description="Versões do currículo e análises anteriores.">
      <div className="space-y-8">
        <section className="space-y-3">
          <h3 className="font-semibold">Versões</h3>
          <VersionHistory />
        </section>

        <section className="space-y-3">
          <h3 className="font-semibold">Análises recentes</h3>
          {isLoading ? (
            <Spinner />
          ) : !data?.analyses.length ? (
            <p className="text-sm text-muted-foreground">Nenhuma análise ainda.</p>
          ) : (
            <ul className="space-y-2">
              {data.analyses.map((item) => (
                <li key={item.id} className="rounded border border-border p-3 text-sm">
                  <p className="font-medium">
                    {item.jobTitle ?? "Vaga"} — {item.jobCompany ?? "Empresa"}
                  </p>
                  <p className="text-muted-foreground">
                    Match {item.matchScore}% · ATS {item.atsScore}% ·{" "}
                    {format(new Date(item.generatedAt), "dd MMM yyyy", { locale: ptBR })}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </ResumeSectionLayout>
  );
};
