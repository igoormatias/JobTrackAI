"use client";

import { Building2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardChartPoint } from "@/types";

const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export type DashboardCompaniesCardProps = {
  companies: DashboardChartPoint[];
};

export const DashboardCompaniesCard = ({ companies }: DashboardCompaniesCardProps) => (
  <Card className="h-full">
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
            <li key={company.label} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">{getInitials(company.label)}</AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium text-foreground">{company.label}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{company.value} vagas</span>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
