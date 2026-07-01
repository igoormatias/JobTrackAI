"use client";

import { Briefcase } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Job } from "@/types";

import { DashboardTopJobCard } from "../DashboardTopJobCard";

export type DashboardTopJobsSectionProps = {
  jobs: Job[];
  isLoading?: boolean;
};

export const DashboardTopJobsSection = ({ jobs }: DashboardTopJobsSectionProps) => (
  <Card className="h-full">
    <CardHeader>
      <CardTitle className="text-base">Melhores vagas</CardTitle>
    </CardHeader>
    <CardContent>
      {jobs.length === 0 ? (
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
