"use client";

import { type ReactNode } from "react";

import { TooltipProvider } from "@/components/ui/Tooltip";
import { NuqsProvider } from "@/providers/nuqs-provider";
import { QueryProvider } from "@/providers/query-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { ToastProvider } from "@/providers/toast-provider";

type AppProvidersProps = {
  children: ReactNode;
};

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider delayDuration={200}>
        <QueryProvider>
          <NuqsProvider>
            {children}
            <ToastProvider />
          </NuqsProvider>
        </QueryProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
};
