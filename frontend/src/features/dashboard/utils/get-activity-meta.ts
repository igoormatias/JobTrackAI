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
  iconClassName: string;
};

export const getActivityMeta = (type: DashboardActivityType): ActivityMeta => {
  const map: Record<DashboardActivityType, ActivityMeta> = {
    job: {
      icon: Briefcase,
      label: "Nova vaga",
      iconClassName: "border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400",
    },
    application: {
      icon: Send,
      label: "Aplicação",
      iconClassName: "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400",
    },
    interview: {
      icon: Calendar,
      label: "Entrevista",
      iconClassName: "border-sky-200 bg-sky-50 text-sky-600 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-400",
    },
    match: {
      icon: Sparkles,
      label: "Match",
      iconClassName: "border-violet-200 bg-violet-50 text-violet-600 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-400",
    },
    favorite: {
      icon: Heart,
      label: "Favorito",
      iconClassName: "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400",
    },
    status_change: {
      icon: RefreshCw,
      label: "Status",
      iconClassName: "border-border bg-muted text-muted-foreground",
    },
  };

  return map[type];
};
