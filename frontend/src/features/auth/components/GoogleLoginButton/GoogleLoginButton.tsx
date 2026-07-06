"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { useLoginMutation } from "../../hooks/use-auth-mutations";
import { GoogleIcon } from "../GoogleIcon";

type LoginButtonStatus = "idle" | "loading" | "success" | "error";

export const GoogleLoginButton = () => {
  const loginMutation = useLoginMutation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(360);
  const [status, setStatus] = useState<LoginButtonStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const updateWidth = () => {
      setButtonWidth(Math.max(Math.floor(element.getBoundingClientRect().width), 240));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (loginMutation.isPending) {
      setStatus("loading");
      return;
    }

    if (loginMutation.isError) {
      setStatus("error");
      setErrorMessage("Não foi possível concluir o login. Tente novamente.");
      return;
    }

    if (loginMutation.isSuccess) {
      setStatus("success");
      return;
    }

    setStatus("idle");
  }, [loginMutation.isPending, loginMutation.isError, loginMutation.isSuccess]);

  const handleSuccess = (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      setStatus("error");
      setErrorMessage("Não foi possível obter credencial do Google.");
      toast.error("Não foi possível obter credencial do Google");
      return;
    }

    setErrorMessage(null);
    loginMutation.mutate(idToken);
  };

  const handleError = () => {
    setStatus("error");
    setErrorMessage("Falha ao entrar com Google.");
    toast.error("Falha ao entrar com Google");
  };

  const isInteractive = status !== "loading" && status !== "success";

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative h-12 w-full"
        role="group"
        aria-label="Entrar com Google"
        aria-live="polite"
        aria-busy={status === "loading"}
      >
        <div
          className={cn(
            "pointer-events-none flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-base font-medium text-primary-foreground shadow-sm transition-transform",
            status === "success" && "bg-emerald-600 text-white",
            status === "loading" && "opacity-80",
          )}
          aria-hidden
        >
          {status === "loading" ? (
            <>
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Entrando…
            </>
          ) : status === "success" ? (
            <>
              <CheckCircle2 className="h-5 w-5" />
              Login realizado
            </>
          ) : (
            <>
              <GoogleIcon className="h-5 w-5" />
              Entrar com Google
            </>
          )}
        </div>

        <div
          className={cn(
            "absolute inset-0 overflow-hidden opacity-0",
            !isInteractive && "pointer-events-none",
          )}
        >
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            text="signin_with"
            shape="rectangular"
            size="large"
            width={buttonWidth}
          />
        </div>
      </div>

      {errorMessage ? (
        <p role="alert" className="text-center text-sm text-destructive lg:text-left">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};
