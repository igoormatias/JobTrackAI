"use client";

import { Muted } from "@/components/typography";

import { useDashboardGreeting } from "../../hooks/use-dashboard-greeting";

export const DashboardWelcome = () => {
  const { greeting, subtitle } = useDashboardGreeting();

  return (
    <section aria-label="Boas-vindas">
      <h1 className="text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{greeting}</h1>
      <Muted className="mt-1 text-sm lg:text-base">{subtitle}</Muted>
    </section>
  );
};
