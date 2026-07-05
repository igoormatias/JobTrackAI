"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Spinner } from "@/components/feedback/Spinner";
import { Muted } from "@/components/typography";

import { consumeCalendarReturnTo } from "../../constants/calendar-oauth";
import { useGoogleCalendarCallbackMutation } from "../../hooks/use-calendar-queries";

type CallbackState = "connecting" | "success" | "error";

const CalendarCallbackContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackMutation = useGoogleCalendarCallbackMutation();
  const [state, setState] = useState<CallbackState>("connecting");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);

  const code = searchParams.get("code");
  const oauthError = searchParams.get("error");

  useEffect(() => {
    if (startedRef.current) return;

    if (oauthError) {
      startedRef.current = true;
      setState("error");
      setErrorMessage("Conexão cancelada ou negada no Google.");
      window.setTimeout(() => router.replace(consumeCalendarReturnTo()), 2500);
      return;
    }

    if (!code) {
      startedRef.current = true;
      setState("error");
      setErrorMessage("Código de autorização não encontrado.");
      window.setTimeout(() => router.replace(consumeCalendarReturnTo()), 2500);
      return;
    }

    startedRef.current = true;
    callbackMutation.mutate(code, {
      onSuccess: () => {
        setState("success");
        toast.success("Google Calendar conectado");
        const returnTo = consumeCalendarReturnTo();
        const separator = returnTo.includes("?") ? "&" : "?";
        window.setTimeout(() => {
          router.replace(`${returnTo}${separator}calendar=connected`);
        }, 800);
      },
      onError: () => {
        setState("error");
        const message = "Falha ao conectar Google Calendar. Verifique as permissões e tente novamente.";
        setErrorMessage(message);
        toast.error(message);
        window.setTimeout(() => {
          router.replace(consumeCalendarReturnTo());
        }, 2500);
      },
    });
  }, [code, oauthError, callbackMutation, router]);

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-16" role="status" aria-live="polite">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" aria-hidden />
        <p className="text-base font-medium text-foreground">Google Calendar conectado</p>
        <Muted>Redirecionando…</Muted>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-16" role="alert">
        <XCircle className="h-10 w-10 text-destructive" aria-hidden />
        <p className="text-base font-medium text-foreground">Não foi possível conectar</p>
        <Muted className="max-w-md text-center">{errorMessage}</Muted>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-16" role="status" aria-live="polite" aria-busy="true">
      <Spinner className="h-8 w-8 text-primary" />
      <p className="text-muted-foreground">Conectando Google Calendar…</p>
    </div>
  );
};

export const CalendarOAuthCallbackPage = () => (
  <Suspense fallback={<p className="py-12 text-center text-muted-foreground">Carregando…</p>}>
    <CalendarCallbackContent />
  </Suspense>
);
