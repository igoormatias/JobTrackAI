"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

import { useCalendarEventsQuery, useCalendarStatusQuery } from "../../hooks/use-calendar-queries";

type CalendarView = "agenda" | "week" | "month";

const VIEW_LABELS: Record<CalendarView, string> = {
  agenda: "Agenda",
  week: "Semanal",
  month: "Mensal",
};

export const CalendarPage = () => {
  const [view, setView] = useState<CalendarView>("agenda");
  const [anchor, setAnchor] = useState(() => new Date());
  const { data: status } = useCalendarStatusQuery();

  const range = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(anchor, { weekStartsOn: 1 });
      return { from: start, to: endOfWeek(anchor, { weekStartsOn: 1 }) };
    }
    if (view === "month") {
      const start = startOfMonth(anchor);
      return { from: startOfWeek(start, { weekStartsOn: 1 }), to: endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 }) };
    }
    return { from: anchor, to: addDays(anchor, 30) };
  }, [anchor, view]);

  const { data: events = [], isLoading } = useCalendarEventsQuery(
    range.from.toISOString(),
    range.to.toISOString(),
  );

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [events],
  );

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [anchor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [anchor]);

  return (
    <div className="space-y-6 pb-24">
      <PageHeader
        title="Career Calendar"
        description="Entrevistas, follow-ups e lembretes da sua jornada."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-md border border-border p-1">
          {(Object.keys(VIEW_LABELS) as CalendarView[]).map((key) => (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={view === key ? "secondary" : "ghost"}
              onClick={() => setView(key)}
            >
              {VIEW_LABELS[key]}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setAnchor(addMonths(anchor, -1))}>
            Anterior
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
            Hoje
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setAnchor(addMonths(anchor, 1))}>
            Próximo
          </Button>
        </div>
      </div>

      {!status?.connected ? (
        <Card>
          <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Conecte seu Google Calendar para sincronizar entrevistas automaticamente.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings?tab=integrations">Configurar integração</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {view === "agenda" ? (
        <div className="space-y-3">
          {isLoading ? <p className="text-sm text-muted-foreground">Carregando eventos…</p> : null}
          {!isLoading && sortedEvents.length === 0 ? (
            <EmptyState
              title="Nenhum evento neste período"
              description="Agende entrevistas no pipeline para vê-las aqui."
            />
          ) : null}
          {sortedEvents.map((event) => (
            <Card key={event.id}>
              <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-foreground">{event.summary}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(event.start), "dd MMM yyyy · HH:mm", { locale: ptBR })}
                  </p>
                  {event.location ? (
                    <p className="text-xs text-muted-foreground">{event.location}</p>
                  ) : null}
                </div>
                {event.htmlLink ? (
                  <Button variant="outline" size="sm" asChild>
                    <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                      Abrir evento
                    </a>
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {view === "week" ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
          {weekDays.map((day) => {
            const dayEvents = sortedEvents.filter((event) => isSameDay(new Date(event.start), day));
            return (
              <Card key={day.toISOString()} className="min-h-32">
                <CardContent className="space-y-2 p-3">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {format(day, "EEE dd", { locale: ptBR })}
                  </p>
                  {dayEvents.map((event) => (
                    <p key={event.id} className="truncate text-xs text-foreground">
                      {format(new Date(event.start), "HH:mm")} · {event.summary}
                    </p>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-1">
          {monthDays.map((day) => {
            const dayEvents = sortedEvents.filter((event) => isSameDay(new Date(event.start), day));
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-20 rounded-md border border-border/60 p-1",
                  !isSameMonth(day, anchor) && "opacity-40",
                )}
              >
                <p className="text-xs text-muted-foreground">{format(day, "d")}</p>
                {dayEvents.slice(0, 2).map((event) => (
                  <p key={event.id} className="truncate text-[10px] text-foreground">
                    {event.summary}
                  </p>
                ))}
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
