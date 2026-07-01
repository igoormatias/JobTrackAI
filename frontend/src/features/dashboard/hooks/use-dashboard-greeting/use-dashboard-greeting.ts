"use client";

import { useCurrentUser } from "@/features/auth";

import { buildDashboardGreeting } from "../../utils/get-dashboard-greeting";

export const useDashboardGreeting = () => {
  const { user } = useCurrentUser();
  const name = user?.name ?? "Usuário";

  return {
    greeting: buildDashboardGreeting(name),
    subtitle: "Vamos encontrar sua próxima oportunidade.",
  };
};
