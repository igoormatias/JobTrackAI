"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Building2, Heart, Briefcase, GitBranch } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
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
              className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs">{getInitials(company.label)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{company.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Última interação{" "}
                      {formatDistanceToNow(new Date(company.lastInteractionAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0 text-[10px] font-semibold">
                  {company.bestMatchScore}% match
                </Badge>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-md bg-muted/50 px-2 py-1.5">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Briefcase className="h-3 w-3" aria-hidden />
                    <span className="text-[10px] uppercase tracking-wide">Vagas</span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{company.totalJobs}</p>
                </div>
                <div className="rounded-md bg-muted/50 px-2 py-1.5">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <GitBranch className="h-3 w-3" aria-hidden />
                    <span className="text-[10px] uppercase tracking-wide">Ativas</span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{company.inProgress}</p>
                </div>
                <div className="rounded-md bg-muted/50 px-2 py-1.5">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Heart className="h-3 w-3" aria-hidden />
                    <span className="text-[10px] uppercase tracking-wide">Favs</span>
                  </div>
                  <p className="mt-0.5 text-sm font-semibold text-foreground">{company.favorites}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
