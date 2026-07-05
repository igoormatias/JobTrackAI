"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Muted } from "@/components/typography";
import type { DashboardInterview } from "@/types";

import { formatInterviewDate, formatInterviewTime } from "../../utils/format-interview-datetime";

export type DashboardInterviewsCardProps = {
  interviews: DashboardInterview[];
  hasCalendarIntegration?: boolean;
};

export const DashboardInterviewsCard = ({
  interviews,
  hasCalendarIntegration = false,
}: DashboardInterviewsCardProps) => (
  <Card className="flex h-full min-h-[220px] w-full min-w-0 flex-col">
    <CardHeader>
      <CardTitle className="text-base">Próximas entrevistas</CardTitle>
    </CardHeader>
    <CardContent className="flex min-h-[140px] min-w-0 flex-1 flex-col">
      {interviews.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-4 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground/60" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Nenhuma entrevista agendada</p>
            <Muted>Avance no pipeline para ver entrevistas aqui.</Muted>
          </div>
          {!hasCalendarIntegration ? (
            <Link
              href="/settings?tab=integrations"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Conectar calendário
            </Link>
          ) : null}
        </div>
      ) : (
        <ul className="space-y-3">
          {interviews.map((interview) => (
            <li key={interview.id} className="rounded-lg border border-border/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{interview.jobTitle}</p>
                  <p className="truncate text-sm text-muted-foreground">{interview.companyName}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {interview.status}
                </Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatInterviewDate(interview.scheduledAt)} · {formatInterviewTime(interview.scheduledAt)}
              </p>
              <div className="mt-2">
                {interview.link ? (
                  <a
                    href={interview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Abrir evento
                  </a>
                ) : (
                  <Link
                    href={`/pipeline/${interview.applicationId}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Abrir evento
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
