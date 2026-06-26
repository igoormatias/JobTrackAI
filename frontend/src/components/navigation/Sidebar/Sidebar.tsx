"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { MAIN_NAV, SECONDARY_NAV } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export type SidebarProps = {
  className?: string;
};

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useAppStore();

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-border bg-card transition-all duration-300 lg:flex",
        isSidebarCollapsed ? "w-16" : "w-60",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-border px-4">
        {!isSidebarCollapsed ? (
          <span className="text-lg font-bold text-foreground">JobTrack AI</span>
        ) : null}
        <Button variant="ghost" size="icon" onClick={toggleSidebarCollapsed} aria-label="Recolher sidebar">
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", isSidebarCollapsed && "rotate-180")}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {MAIN_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                isSidebarCollapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed ? item.label : null}
            </Link>
          );
        })}

        <div className="my-3 border-t border-border" />

        {SECONDARY_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
                isSidebarCollapsed && "justify-center px-2",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isSidebarCollapsed ? item.label : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2",
            isSidebarCollapsed && "justify-center",
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          {!isSidebarCollapsed ? (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">João Dev</p>
              <p className="truncate text-xs text-muted-foreground">joao@email.com</p>
            </div>
          ) : null}
          {!isSidebarCollapsed ? (
            <Button variant="ghost" size="icon" aria-label="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
};
