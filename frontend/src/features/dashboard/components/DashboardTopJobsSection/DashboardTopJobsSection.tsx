"use client";

import { Briefcase } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/feedback/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Job } from "@/types";

import { DashboardTopJobCard } from "../DashboardTopJobCard";

export type DashboardTopJobsSectionProps = {
  jobs: Job[];
  isLoading?: boolean;
};

export const DashboardTopJobsSection = ({ jobs, isLoading = false }: DashboardTopJobsSectionProps) => (
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
      ) : jobs.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Nenhuma vaga encontrada"
          description="Complete seu perfil para receber recomendações personalizadas."
        />
      ) : (
        <div className="space-y-3">
          {jobs.slice(0, 5).map((job) => (
            <DashboardTopJobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </CardContent>
  </Card>
);
