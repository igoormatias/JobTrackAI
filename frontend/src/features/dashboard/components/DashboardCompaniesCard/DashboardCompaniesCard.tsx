"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardCompanyInsight } from "@/types";

const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export type DashboardCompaniesCardProps = {
  companies: DashboardCompanyInsight[];
};

export const DashboardCompaniesCard = ({ companies }: DashboardCompaniesCardProps) => (
  <Card className="h-full min-w-0">
    <CardHeader>
      <CardTitle className="text-base">Empresas recorrentes</CardTitle>
    </CardHeader>
    <CardContent>
      {companies.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Building2 className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Nenhuma empresa destacada ainda.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {companies.map((company) => (
            <li
              key={company.label}
              className="rounded-lg border border-border/60 p-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="text-xs">{getInitials(company.label)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{company.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {company.totalJobs} vagas · {company.inProgress} processos ativos ·{" "}
                    {company.bestMatchScore}% match médio
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Última interação{" "}
                    {formatDistanceToNow(new Date(company.lastInteractionAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
