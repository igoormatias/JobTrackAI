import {
  Briefcase,
  Calendar,
  Heart,
  RefreshCw,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import type { DashboardActivityType } from "@/types";

export type ActivityMeta = {
  icon: LucideIcon;
  label: string;
};

export const getActivityMeta = (type: DashboardActivityType): ActivityMeta => {
  const map: Record<DashboardActivityType, ActivityMeta> = {
    job: { icon: Briefcase, label: "Nova vaga" },
    application: { icon: Send, label: "Aplicação" },
    interview: { icon: Calendar, label: "Entrevista" },
    match: { icon: Sparkles, label: "Match" },
    favorite: { icon: Heart, label: "Favorito" },
    status_change: { icon: RefreshCw, label: "Status" },
  };

  return map[type];
};
