"use client";

import { Body, Muted } from "@/components/typography";

import { GoogleLoginButton } from "../../components/GoogleLoginButton";
import { JobTrackLogo } from "../../components/JobTrackLogo";
import { useAuth } from "../../hooks/use-auth";
import { LoadingSessionPage } from "../LoadingSessionPage";

export const LoginPage = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSessionPage />;
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8">
      <JobTrackLogo />

      <div className="space-y-2 text-center">
        <Body className="text-base text-muted-foreground">
          Sua busca por emprego, inteligente e organizada.
        </Body>
      </div>

      <div className="w-full space-y-6">
        <GoogleLoginButton />
        <Muted className="text-center text-xs leading-relaxed">
          Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade.
        </Muted>
      </div>
    </div>
  );
};
