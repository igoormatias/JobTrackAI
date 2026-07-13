"use client";

import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchInput } from "@/components/ui/SearchInput";
import { Badge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { TooltipProvider, TooltipWrapper } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

import type { CalendarEventItem } from "../../services/calendar-service";
import { useCalendarEventsQuery, useCalendarStatusQuery } from "../../hooks/use-calendar-queries";
import { getAgendaGroupLabel, parseLocalDayKey } from "../../utils/agenda-group-label";

type CalendarView = "agenda" | "week" | "month";

const VIEW_LABELS: Record<CalendarView, string> = {
  agenda: "Agenda",
  week: "Semanal",
  month: "Mensal",
};

const navigateAnchor = (view: CalendarView, anchor: Date, direction: -1 | 1): Date => {
  if (view === "week") return addWeeks(anchor, direction);
  if (view === "month") return addMonths(anchor, direction);
  return addDays(anchor, direction * 30);
};

const getHeaderLabel = (view: CalendarView, anchor: Date): string => {
  if (view === "month") {
    return format(anchor, "MMMM 'de' yyyy", { locale: ptBR });
  }
  if (view === "week") {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    const end = endOfWeek(anchor, { weekStartsOn: 1 });
    return `${format(start, "d MMM", { locale: ptBR })} – ${format(end, "d MMM yyyy", { locale: ptBR })}`;
  }
  return "Próximos 30 dias";
};

const EventTooltipContent = ({ event }: { event: CalendarEventItem }) => (
  <div className="space-y-1 text-xs">
    <p className="font-medium">{event.summary}</p>
    {event.companyName ? <p>Empresa: {event.companyName}</p> : null}
    {event.jobTitle ? <p>Cargo: {event.jobTitle}</p> : null}
    {event.stage ? <p>Etapa: {event.stage}</p> : null}
    {event.meetingType ? <p>Modalidade: {event.meetingType}</p> : null}
    {event.location ? <p>Local: {event.location}</p> : null}
    {event.description ? <p className="max-w-xs">{event.description}</p> : null}
  </div>
);

const EventChip = ({
  event,
  compact = false,
  onSelect,
}: {
  event: CalendarEventItem;
  compact?: boolean;
  onSelect?: (event: CalendarEventItem) => void;
}) => {
  const label = compact
    ? `${format(new Date(event.start), "HH:mm")} · ${event.summary}`
    : event.summary;

  const chip = (
    <button
      type="button"
      className={cn(
        "w-full rounded px-1 py-0.5 text-left transition-colors hover:bg-primary/10",
        compact ? "truncate text-[10px]" : "truncate text-xs",
        event.source === "google" ? "border-l-2 border-sky-400 pl-1.5" : "border-l-2 border-violet-400 pl-1.5",
      )}
      onClick={() => onSelect?.(event)}
    >
      {label}
    </button>
  );

  return (
    <TooltipWrapper content={<EventTooltipContent event={event} />}>
      {chip}
    </TooltipWrapper>
  );
};

export const CalendarPage = () => {
  const [view, setView] = useState<CalendarView>("agenda");
  const [anchor, setAnchor] = useState(() => new Date());
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventItem | null>(null);
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

  const sortedEvents = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? events.filter((event) => {
          const haystack = [
            event.summary,
            event.companyName,
            event.jobTitle,
            event.stage,
            event.location,
            event.description,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return haystack.includes(query);
        })
      : events;
    return [...filtered].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }, [events, search]);

  const agendaGroups = useMemo(() => {
    const groups = new Map<string, CalendarEventItem[]>();
    for (const event of sortedEvents) {
      const dayKey = format(new Date(event.start), "yyyy-MM-dd");
      const existing = groups.get(dayKey) ?? [];
      existing.push(event);
      groups.set(dayKey, existing);
    }
    return Array.from(groups.entries()).map(([dayKey, dayEvents]) => ({
      dayKey,
      label: getAgendaGroupLabel(parseLocalDayKey(dayKey)),
      events: dayEvents,
    }));
  }, [sortedEvents]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [anchor]);

  const weekDays = useMemo(() => {
    const start = startOfWeek(anchor, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [anchor]);

  return (
    <TooltipProvider>
      <div className="space-y-6 pb-24">
        <PageHeader
          title="Career Calendar"
          description="Entrevistas, follow-ups e lembretes da sua jornada."
        />

        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onClear={() => setSearch("")}
          placeholder="Buscar eventos, empresa ou cargo..."
          aria-label="Buscar no calendário"
          className="max-w-md"
        />

        <div className="flex flex-col gap-4">
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
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Período anterior"
                onClick={() => setAnchor(navigateAnchor(view, anchor, -1))}
              >
                ←
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setAnchor(new Date())}>
                Hoje
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                aria-label="Próximo período"
                onClick={() => setAnchor(navigateAnchor(view, anchor, 1))}
              >
                →
              </Button>
            </div>
          </div>

          <h2 className="text-lg font-semibold capitalize text-foreground">{getHeaderLabel(view, anchor)}</h2>
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
          <div className="space-y-6">
            {isLoading ? <p className="text-sm text-muted-foreground">Carregando eventos…</p> : null}
            {!isLoading && sortedEvents.length === 0 ? (
              <EmptyState
                title="Nenhum evento neste período"
                description="Agende entrevistas no pipeline para vê-las aqui."
              />
            ) : null}
            {agendaGroups.map((group) => (
              <section key={group.dayKey} className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">{group.label}</h3>
                {group.events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="line-clamp-2 font-medium text-foreground">{event.summary}</p>
                          <Badge variant="outline" className="shrink-0 text-[10px]">
                            {event.source === "google" ? "Google" : "Entrevista"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.start), "dd MMM yyyy · HH:mm", { locale: ptBR })}
                        </p>
                        {event.companyName ? (
                          <p className="line-clamp-1 text-xs text-muted-foreground">{event.companyName}</p>
                        ) : null}
                      </div>
                      {event.trackingId ? (
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/pipeline/${event.trackingId}`}>Ver detalhes</Link>
                        </Button>
                      ) : event.htmlLink ? (
                        <Button variant="outline" size="sm" asChild>
                          <a href={event.htmlLink} target="_blank" rel="noopener noreferrer">
                            Abrir evento
                          </a>
                        </Button>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </section>
            ))}
          </div>
        ) : null}

        {view === "week" ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
            {weekDays.map((day) => {
              const dayEvents = sortedEvents.filter((event) => isSameDay(new Date(event.start), day));
              const today = isToday(day);
              return (
                <Card
                  key={day.toISOString()}
                  className={cn("min-h-36", today && "border-primary/40 bg-primary/5")}
                >
                  <CardContent className="flex h-full flex-col gap-2 p-3">
                    <div>
                      <p className="text-xs font-semibold capitalize text-muted-foreground">
                        {format(day, "EEEE", { locale: ptBR })}
                      </p>
                      <p className={cn("text-sm font-medium", today && "text-primary")}>
                        {format(day, "dd MMM", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="max-h-40 space-y-1 overflow-y-auto scrollbar-app">
                      {dayEvents.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground">—</p>
                      ) : (
                        dayEvents.map((event) => (
                          <div key={event.id} className="space-y-0.5">
                            <p className="text-[10px] font-medium text-muted-foreground">
                              {format(new Date(event.start), "HH:mm")}
                            </p>
                            <EventChip event={event} onSelect={setSelectedEvent} />
                            {event.companyName ? (
                              <p className="line-clamp-1 pl-1.5 text-[10px] text-muted-foreground">
                                {event.companyName}
                              </p>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
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
                    "min-h-24 rounded-md border border-border/60 p-1",
                    !isSameMonth(day, anchor) && "opacity-40",
                    isToday(day) && "border-primary/40 bg-primary/5",
                  )}
                >
                  <p className="text-xs text-muted-foreground">{format(day, "d")}</p>
                  {dayEvents.slice(0, 2).map((event) => (
                    <EventChip key={event.id} event={event} compact onSelect={setSelectedEvent} />
                  ))}
                  {dayEvents.length > 2 ? (
                    <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 2} mais</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : null}

        <BottomSheet
          open={selectedEvent != null}
          onOpenChange={(open) => {
            if (!open) setSelectedEvent(null);
          }}
          title={selectedEvent?.summary ?? "Evento"}
        >
          {selectedEvent ? (
            <div className="space-y-3 text-sm">
              <EventTooltipContent event={selectedEvent} />
              {selectedEvent.trackingId ? (
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/pipeline/${selectedEvent.trackingId}`}>Ver detalhes</Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </BottomSheet>
      </div>
    </TooltipProvider>
  );
};
