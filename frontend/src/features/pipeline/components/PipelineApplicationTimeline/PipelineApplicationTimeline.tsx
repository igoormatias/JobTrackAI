import type { TimelineEvent } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export type PipelineApplicationTimelineProps = {
  events: TimelineEvent[];
};

export const PipelineApplicationTimeline = ({ events }: PipelineApplicationTimelineProps) => {
  if (events.length === 0) return null;

  const sorted = [...events].sort(
    (a, b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime(),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-0 border-l border-border pl-4">
          {sorted.map((event) => (
            <li key={event.id} className="relative pb-5 last:pb-0">
              <span className="absolute -left-[1.35rem] mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-sm font-medium text-foreground">{event.title}</p>
              <time className="text-xs text-muted-foreground" dateTime={event.occurredAt}>
                {new Date(event.occurredAt).toLocaleDateString("pt-BR")}
              </time>
              {event.description ? (
                <p className="text-xs text-muted-foreground">{event.description}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
};
