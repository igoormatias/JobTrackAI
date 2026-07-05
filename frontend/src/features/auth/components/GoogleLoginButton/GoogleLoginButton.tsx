"use client";

import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

import { useLoginMutation } from "../../hooks/use-auth-mutations";
import { GoogleIcon } from "../GoogleIcon";

type LoginButtonStatus = "idle" | "loading" | "success" | "error";

export const GoogleLoginButton = () => {
  const loginMutation = useLoginMutation();
  const googleContainerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<LoginButtonStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleCustomClick = () => {
    if (status === "loading" || status === "success") return;

    setErrorMessage(null);
    const googleButton = googleContainerRef.current?.querySelector('[role="button"]') as HTMLElement | null;
    googleButton?.click();
  };

  return (
    <div className="space-y-3">
      <div ref={googleContainerRef} className="sr-only" aria-hidden>
        <GoogleLogin onSuccess={handleSuccess} onError={handleError} text="signin_with" shape="rectangular" size="large" width="360" />
      </div>

      <Button
        type="button"
        size="lg"
        className={cn(
          "h-12 w-full rounded-xl text-base font-medium shadow-sm transition-transform hover:scale-[1.01] active:scale-[0.99]",
          status === "success" && "bg-emerald-600 text-white hover:bg-emerald-600",
        )}
        onClick={handleCustomClick}
        isLoading={status === "loading"}
        disabled={status === "loading" || status === "success"}
        aria-live="polite"
        aria-busy={status === "loading"}
      >
        {status === "success" ? (
          <>
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            Login realizado
          </>
        ) : (
          <>
            <GoogleIcon className="h-5 w-5" aria-hidden />
            Entrar com Google
          </>
        )}
      </Button>

      {errorMessage ? (
        <p role="alert" className="text-center text-sm text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};
