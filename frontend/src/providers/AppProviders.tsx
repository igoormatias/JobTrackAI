"use client";

import { type ReactNode } from "react";

import { SessionProvider } from "@/features/auth/context/SessionProvider";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { GoogleAuthProvider } from "@/providers/google-auth-provider";
import { NuqsProvider } from "@/providers/nuqs-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <GoogleAuthProvider>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider delayDuration={200}>
          <QueryProvider>
            <SessionProvider>
              <NuqsProvider>
                {children}
                <ToastProvider />
              </NuqsProvider>
            </SessionProvider>
          </QueryProvider>
        </TooltipProvider>
      </ThemeProvider>
    </GoogleAuthProvider>
  );
};
