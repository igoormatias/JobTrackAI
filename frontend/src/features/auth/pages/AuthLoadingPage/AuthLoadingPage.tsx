"use client";

import { useEffect, useState } from "react";

import { JobTrackLogo } from "@/components/brand";
import { Spinner } from "@/components/feedback/Spinner";
import { Muted } from "@/components/typography";

import { AUTH_LOADING_MESSAGES } from "../../constants/login-content";

export type AuthLoadingPageProps = {
  messages?: readonly string[];
};

export const AuthLoadingPage = ({
  messages = AUTH_LOADING_MESSAGES,
}: AuthLoadingPageProps) => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;

    const interval = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, [messages]);

  return (
    <div
      className="flex min-h-[50vh] w-full flex-col items-center justify-center gap-6 px-4"
      aria-live="polite"
      aria-busy="true"
      aria-label="Carregando autenticação"
    >
      <JobTrackLogo variant="mark" theme="dark" priority />
      <Spinner className="h-8 w-8 text-primary" />
      <Muted className="text-center text-sm sm:text-base">{messages[messageIndex]}</Muted>
    </div>
  );
};

/** @deprecated Use AuthLoadingPage */
export const LoadingSessionPage = AuthLoadingPage;
