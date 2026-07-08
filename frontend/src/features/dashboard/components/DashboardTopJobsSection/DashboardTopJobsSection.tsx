"use client";

import Link from "next/link";
import { Briefcase } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ACTION_LABELS } from "@/constants/action-labels";
import type { Job } from "@/types";

import { DashboardTopJobCard } from "../DashboardTopJobCard";

const TOP_MATCH_THRESHOLD = 60;

export type DashboardTopJobsSectionProps = {
  jobs: Job[];
  isLoading?: boolean;
};

export const DashboardTopJobsSection = ({ jobs, isLoading = false }: DashboardTopJobsSectionProps) => {
  const compatibleJobs = jobs.filter((job) => job.matchScore.score >= TOP_MATCH_THRESHOLD);

  return (
    <Card className="h-full w-full min-w-0">
      <CardHeader>
        <CardTitle className="text-base">Melhores vagas</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3" aria-busy="true" aria-label="Carregando melhores vagas">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="space-y-2 rounded-lg border border-border/60 p-4">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        ) : compatibleJobs.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Não encontramos vagas altamente compatíveis."
            description="Nenhuma oportunidade com Match acima de 60% no momento. Explore o catálogo ou ajuste seu perfil."
            action={
              <Button asChild>
                <Link href="/jobs">{ACTION_LABELS.exploreJobs}</Link>
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {compatibleJobs.slice(0, 5).map((job) => (
              <DashboardTopJobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
