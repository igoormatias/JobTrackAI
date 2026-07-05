"use client";

import { Calendar, Link2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Muted } from "@/components/typography";

import {
  useCalendarStatusQuery,
  useGoogleCalendarConnectMutation,
} from "@/features/calendar/hooks/use-calendar-queries";

export type CalendarStepProps = {
  onSkip: () => void;
};

export const CalendarStep = ({ onSkip }: CalendarStepProps) => {
  const { data: status, isLoading } = useCalendarStatusQuery();
  const connectMutation = useGoogleCalendarConnectMutation("/onboarding");

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Calendar className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Google Calendar</p>
              <Muted>
                Sincronize entrevistas do pipeline automaticamente e visualize tudo na agenda de carreira.
              </Muted>
            </div>
          </div>

          {isLoading ? <Muted>Verificando conexão…</Muted> : null}

          {!isLoading && status?.connected ? (
            <p className="text-sm font-medium text-emerald-500">Google Calendar conectado</p>
          ) : null}

          {!isLoading && !status?.connected ? (
            <Button
              type="button"
              onClick={() => connectMutation.mutate()}
              disabled={connectMutation.isPending}
              className="w-full"
            >
              <Link2 className="h-4 w-4" aria-hidden />
              Conectar Google Calendar
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Button type="button" variant="ghost" className="w-full" onClick={onSkip}>
        Pular por agora
      </Button>
    </div>
  );
};
