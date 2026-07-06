"use client";

import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardChartPoint } from "@/types";

export type DashboardTechnologiesCardProps = {
  technologies: DashboardChartPoint[];
};

export const DashboardTechnologiesCard = ({ technologies }: DashboardTechnologiesCardProps) => {
  const maxValue = Math.max(...technologies.map((item) => item.value), 1);

  return (
    <Card className="h-full min-w-0">
      <CardHeader>
        <CardTitle className="text-base">Competências mais encontradas</CardTitle>
      </CardHeader>
      <CardContent>
        {technologies.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma competência destacada nas suas vagas.</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/jobs" className={buttonVariants({ variant: "default", size: "sm" })}>
                Explorar vagas
              </Link>
              <Link href="/account/profile" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Atualizar perfil
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {technologies.map((tech) => (
              <div key={tech.label} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="max-w-[70%] truncate">
                    {tech.label}
                  </Badge>
                  <span className="shrink-0 text-xs text-muted-foreground">{tech.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${(tech.value / maxValue) * 100}%` }}
                    role="presentation"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
