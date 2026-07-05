"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

import { connectGoogleCalendar } from "@/features/calendar/services/calendar-service";

const CalendarCallbackContent = () => {
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  useEffect(() => {
    if (!code) return;
    void connectGoogleCalendar(code)
      .then(() => {
        toast.success("Google Calendar conectado");
        window.location.href = "/settings?tab=integrations";
      })
      .catch(() => {
        toast.error("Falha ao conectar Google Calendar");
        window.location.href = "/settings?tab=integrations";
      });
  }, [code]);

  return <p className="py-12 text-center text-muted-foreground">Conectando Google Calendar…</p>;
};

export const CalendarOAuthCallbackPage = () => (
  <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Carregando…</p>}>
    <CalendarCallbackContent />
  </Suspense>
);
