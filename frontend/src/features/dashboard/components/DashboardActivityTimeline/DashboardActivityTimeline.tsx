"use client";

import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Activity } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardActivity } from "@/types";

import { getActivityMeta } from "../../utils/get-activity-meta";

export type DashboardActivityTimelineProps = {
  activities: DashboardActivity[];
};

export const DashboardActivityTimeline = ({ activities }: DashboardActivityTimelineProps) => (
  <Card className="h-full min-w-0">
    <CardHeader>
      <CardTitle className="text-base">Atividades recentes</CardTitle>
    </CardHeader>
    <CardContent>
      {activities.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Nenhuma atividade recente"
          description="Suas ações e novidades aparecerão aqui em tempo real."
        />
      ) : (
        <ol className="relative space-y-0 border-l border-border pl-4">
          {activities.map((activity) => {
            const meta = getActivityMeta(activity.type);
            const Icon = meta.icon;

            return (
              <li key={activity.id} className="relative pb-6 last:pb-0">
                <span className="absolute left-[1.35rem] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background">
                  <Icon className="h-3 w-3 text-primary" aria-hidden="true" />
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="truncate text-sm font-medium text-foreground">{activity.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{activity.description}</p>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={activity.occurredAt}
                  >
                    {formatDistanceToNow(new Date(activity.occurredAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </CardContent>
  </Card>
);
