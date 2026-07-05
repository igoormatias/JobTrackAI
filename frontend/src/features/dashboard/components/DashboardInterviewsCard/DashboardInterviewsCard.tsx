"use client";

import { Calendar, ExternalLink } from "lucide-react";
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

const formatMeetingType = (value: string | null): string | null => {
  if (!value) return null;
  const map: Record<string, string> = {
    video: "Vídeo",
    phone: "Telefone",
    onsite: "Presencial",
    in_person: "Presencial",
  };
  return map[value] ?? value;
};

export const DashboardInterviewsCard = ({
  interviews,
  hasCalendarIntegration = false,
}: DashboardInterviewsCardProps) => (
  <Card className="flex h-full w-full min-w-0 flex-col">
    <CardHeader className="pb-3">
      <CardTitle className="text-base">Próximas entrevistas</CardTitle>
    </CardHeader>
    <CardContent className="flex min-h-0 flex-1 flex-col">
      {interviews.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 py-6 text-center">
          <Calendar className="h-8 w-8 text-muted-foreground/60" aria-hidden />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Nenhuma entrevista agendada</p>
            <Muted>
              Assim que você cadastrar uma entrevista ou sincronizar seu Google Calendar ela
              aparecerá aqui.
            </Muted>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/pipeline" className={buttonVariants({ variant: "default", size: "sm" })}>
              Ir para o pipeline
            </Link>
            {!hasCalendarIntegration ? (
              <Link
                href="/settings?tab=integrations"
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                Conectar calendário
              </Link>
            ) : null}
          </div>
        </div>
      ) : (
        <ul className="max-h-[320px] space-y-2 overflow-y-auto pr-1 scrollbar-app">
          {interviews.map((interview) => {
            const meetingType = formatMeetingType(interview.meetingType);
            const detailHref =
              interview.trackingId != null
                ? `/pipeline/${interview.trackingId}`
                : interview.link ?? undefined;

            return (
              <li
                key={interview.id}
                className="rounded-lg border border-border/60 p-3 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 font-medium text-foreground">{interview.jobTitle}</p>
                    <p className="line-clamp-1 text-sm text-muted-foreground">{interview.companyName}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">
                    {interview.source === "google" ? "Google" : interview.stage}
                  </Badge>
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {formatInterviewDate(interview.scheduledAt)} · {formatInterviewTime(interview.scheduledAt)}
                  {meetingType ? ` · ${meetingType}` : ""}
                </p>
                {interview.location ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{interview.location}</p>
                ) : null}
                <div className="mt-2">
                  {detailHref ? (
                    interview.trackingId != null ? (
                      <Link
                        href={detailHref}
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        Ver detalhes
                      </Link>
                    ) : (
                      <a
                        href={detailHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={buttonVariants({ variant: "outline", size: "sm" })}
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" aria-hidden />
                        Ver detalhes
                      </a>
                    )
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </CardContent>
  </Card>
);
