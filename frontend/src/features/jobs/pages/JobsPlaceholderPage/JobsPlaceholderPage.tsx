"use client";

import { MatchReasonsList } from "@/features/recommendations/components/MatchReasonsList";
import { MatchScoreBadge } from "@/features/recommendations/components/MatchScoreBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Muted } from "@/components/typography";

import { useJobs } from "../../hooks/use-jobs";

export const JobsPlaceholderPage = () => {
  const { data, isLoading, isError } = useJobs();

  return (
    <div className="space-y-6">
      <PageHeader title="Vagas" description="Explore oportunidades compatíveis com seu perfil." />

      {isLoading ? <Muted>Carregando vagas personalizadas...</Muted> : null}
      {isError ? <Muted>Não foi possível carregar as vagas.</Muted> : null}

      <div className="space-y-4">
        {data?.data.map((job) => (
          <Card key={job.id}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg">{job.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {job.company.name} · {job.location} · {job.modality}
                </p>
              </div>
              <MatchScoreBadge matchScore={job.matchScore} />
            </CardHeader>
            <CardContent>
              <MatchReasonsList matchScore={job.matchScore} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
