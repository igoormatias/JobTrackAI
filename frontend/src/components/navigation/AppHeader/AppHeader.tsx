"use client";

import { Bell } from "lucide-react";
import { type ReactNode } from "react";

import { NotificationBadge } from "@/components/badges/NotificationBadge";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

export type AppHeaderProps = {
  title?: string;
  greeting?: string;
  showSearch?: boolean;
  actions?: ReactNode;
  className?: string;
};

export const AppHeader = ({
  title,
  greeting = "Olá, Alex!",
  showSearch = true,
  actions,
  className,
}: AppHeaderProps) => (
  <header
    className={cn(
      "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
      className,
    )}
  >
    <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
      <div>
        <p className="text-xs text-muted-foreground lg:hidden">JobTrack AI</p>
        <h1 className="text-xl font-bold text-foreground lg:text-2xl">{title ?? greeting}</h1>
      </div>

      <div className="flex items-center gap-3">
        {showSearch ? (
          <SearchInput placeholder="Buscar..." className="hidden w-64 md:block" />
        ) : null}
        {actions}
        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Notificações"
        >
          <Bell className="h-5 w-5" />
          <NotificationBadge count={3} />
        </button>
      </div>
    </div>
  </header>
);
