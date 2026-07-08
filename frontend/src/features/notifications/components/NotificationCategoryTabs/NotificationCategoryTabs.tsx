"use client";

import type { NotificationCategory } from "@/types";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const TABS: Array<{ id: NotificationCategory | "all"; label: string }> = [
  { id: "all", label: "Todas" },
  { id: "jobs", label: "Novas vagas" },
  { id: "favorites", label: "Empresas favoritas" },
  { id: "pipeline", label: "Pipeline" },
  { id: "followup", label: "Follow-up" },
  { id: "calendar", label: "Calendário" },
  { id: "system", label: "Sincronizações" },
  { id: "alerts", label: "Alertas" },
];

export type NotificationCategoryTabsProps = {
  value: NotificationCategory | "all";
  counts?: Partial<Record<NotificationCategory | "all", number>>;
  onChange: (value: NotificationCategory | "all") => void;
};

export const NotificationCategoryTabs = ({
  value,
  counts,
  onChange,
}: NotificationCategoryTabsProps) => (
  <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categorias de notificação">
    {TABS.map((tab) => (
      <Button
        key={tab.id}
        type="button"
        size="sm"
        role="tab"
        aria-selected={value === tab.id}
        variant={value === tab.id ? "secondary" : "outline"}
        className={cn("gap-1")}
        onClick={() => onChange(tab.id)}
      >
        {tab.label}
        {counts?.[tab.id] ? (
          <span className="rounded-full bg-primary/15 px-1.5 text-[10px]">{counts[tab.id]}</span>
        ) : null}
      </Button>
    ))}
  </div>
);
