"use client";

import { Calendar } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardInterview } from "@/types";

import { formatInterviewDate, formatInterviewTime } from "../../utils/format-interview-datetime";

export type DashboardInterviewsCardProps = {
  interviews: DashboardInterview[];
};

export const DashboardInterviewsCard = ({ interviews }: DashboardInterviewsCardProps) => (
  <Card className="h-full w-full min-w-0">
    <CardHeader>
      <CardTitle className="text-base">Próximas entrevistas</CardTitle>
    </CardHeader>
    <CardContent className="min-w-0">
      {interviews.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="Nenhuma entrevista agendada"
          description="Quando você avançar no pipeline, suas entrevistas aparecerão aqui."
          className="py-8"
        />
      ) : (
        <ul className="space-y-4">
          {interviews.map((interview) => (
            <li
              key={interview.id}
              className="rounded-lg border border-border/60 p-3"
            >
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
            </li>
          ))}
        </ul>
      )}
    </CardContent>
  </Card>
);
