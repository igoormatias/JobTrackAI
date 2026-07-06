import type { TimelineEvent } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { TooltipWrapper } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export type PipelineApplicationTimelineProps = {
  events: TimelineEvent[];
  currentStage?: string | null;
  variant?: "card" | "embedded";
};

const formatFullDateTime = (value: string): string =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const buildTooltipContent = (event: TimelineEvent) => {
  const createdBy =
    typeof event.metadata.createdByName === "string"
      ? event.metadata.createdByName
      : typeof event.metadata.createdById === "string"
        ? event.metadata.createdById
        : null;

  return (
    <div className="space-y-1 text-xs">
      <p>{formatFullDateTime(event.occurredAt)}</p>
      {event.description ? <p>{event.description}</p> : null}
      {createdBy ? <p>Registrado por: {createdBy}</p> : null}
    </div>
  );
};

const TimelineList = ({
  events,
  currentStage,
}: Pick<PipelineApplicationTimelineProps, "events" | "currentStage">) => {
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  return (
    <ol className="relative border-l-2 border-primary/30 pl-5">
      {sorted.map((event) => {
        const isCurrent =
          event.type === "stage_changed" &&
          currentStage &&
          event.metadata.stage === currentStage;

        return (
          <li key={event.id} className="relative grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1 pb-6 last:pb-0">
            <span
              className={cn(
                "absolute -left-[1.6rem] mt-1.5 h-3 w-3 rounded-full border-2 border-background",
                isCurrent ? "bg-primary ring-2 ring-primary/30" : "bg-muted-foreground/50",
              )}
            />
            <div className="col-span-2 min-w-0">
              <TooltipWrapper content={buildTooltipContent(event)}>
                <p
                  className={cn(
                    "text-sm font-medium text-foreground",
                    isCurrent && "text-primary",
                  )}
                >
                  {event.title}
                </p>
              </TooltipWrapper>
              {event.description ? (
                <p className="mt-1 break-words text-xs text-muted-foreground">{event.description}</p>
              ) : null}
            </div>
            <time
              className="shrink-0 text-right text-xs text-muted-foreground"
              dateTime={event.occurredAt}
            >
              {new Date(event.occurredAt).toLocaleDateString("pt-BR")}
            </time>
          </li>
        );
      })}
    </ol>
  );
};

export const PipelineApplicationTimeline = ({
  events,
  currentStage,
  variant = "card",
}: PipelineApplicationTimelineProps) => {
  if (events.length === 0) return null;

  if (variant === "embedded") {
    return <TimelineList events={events} currentStage={currentStage} />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico</CardTitle>
      </CardHeader>
      <CardContent>
        <TimelineList events={events} currentStage={currentStage} />
      </CardContent>
    </Card>
  );
};
