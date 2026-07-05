"use client";

import { Calendar, Link2, RefreshCw, Unlink } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Muted } from "@/components/typography";

import {
  useCalendarStatusQuery,
  useGoogleCalendarConnectMutation,
  useGoogleCalendarDisconnectMutation,
  useGoogleCalendarSyncMutation,
} from "../../hooks/use-calendar-queries";

export const GoogleCalendarIntegrationCard = () => {
  const { data: status, isLoading } = useCalendarStatusQuery();
  const connectMutation = useGoogleCalendarConnectMutation();
  const disconnectMutation = useGoogleCalendarDisconnectMutation();
  const syncMutation = useGoogleCalendarSyncMutation();

  const isConnecting = connectMutation.isPending;
  const isBusy = disconnectMutation.isPending || syncMutation.isPending;

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
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-500">Google Calendar conectado</p>
            {status.accountEmail ? (
              <p className="text-sm text-foreground">
                Conta: <span className="font-medium">{status.accountEmail}</span>
              </p>
            ) : null}
            {status.calendarId ? (
              <p className="text-sm text-muted-foreground">Calendário: {status.calendarId}</p>
            ) : null}
            {status.connectedAt ? (
              <Muted>
                Conectado em {format(new Date(status.connectedAt), "dd MMM yyyy", { locale: ptBR })}
              </Muted>
            ) : null}
            {status.lastSyncAt ? (
              <Muted>
                Última sincronização:{" "}
                {format(new Date(status.lastSyncAt), "dd MMM yyyy HH:mm", { locale: ptBR })}
              </Muted>
            ) : null}
            {status.lastError ? (
              <p className="text-sm text-destructive" role="alert">
                {status.lastError}
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => syncMutation.mutate()}
                disabled={isBusy}
                isLoading={syncMutation.isPending}
              >
                <RefreshCw className="h-4 w-4" aria-hidden />
                Sincronizar agora
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => disconnectMutation.mutate()}
                disabled={isBusy}
                isLoading={disconnectMutation.isPending}
              >
                <Unlink className="h-4 w-4" aria-hidden />
                Desconectar
              </Button>
            </div>
          </div>
        ) : null}

        {!isLoading && !status?.connected ? (
          <Button
            type="button"
            onClick={() => connectMutation.mutate()}
            disabled={isConnecting}
            isLoading={isConnecting}
            className="w-full sm:w-auto"
          >
            <Link2 className="h-4 w-4" aria-hidden />
            Conectar Google Calendar
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};
