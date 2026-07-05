"use client";

import { Calendar, Link2, Unlink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Muted } from "@/components/typography";

import {
  useCalendarStatusQuery,
  useGoogleCalendarConnectMutation,
  useGoogleCalendarDisconnectMutation,
} from "../../hooks/use-calendar-queries";

export const GoogleCalendarIntegrationCard = () => {
  const { data: status, isLoading } = useCalendarStatusQuery();
  const connectMutation = useGoogleCalendarConnectMutation();
  const disconnectMutation = useGoogleCalendarDisconnectMutation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 space-y-0">
        <Calendar className="h-5 w-5 text-muted-foreground" aria-hidden />
        <CardTitle className="text-base">Google Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sincronize entrevistas do pipeline com seu Google Calendar automaticamente.
        </p>

        {isLoading ? <Muted>Carregando status…</Muted> : null}

        {!isLoading && status?.connected ? (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Conectado</p>
            {status.connectedAt ? (
              <Muted>
                Desde {format(new Date(status.connectedAt), "dd MMM yyyy", { locale: ptBR })}
              </Muted>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => disconnectMutation.mutate()}
              disabled={disconnectMutation.isPending}
            >
              <Unlink className="mr-2 h-4 w-4" />
              Desconectar
            </Button>
          </div>
        ) : null}

        {!isLoading && !status?.connected ? (
          <Button
            type="button"
            onClick={() => connectMutation.mutate()}
            disabled={connectMutation.isPending}
          >
            <Link2 className="mr-2 h-4 w-4" />
            Conectar Google Calendar
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};
