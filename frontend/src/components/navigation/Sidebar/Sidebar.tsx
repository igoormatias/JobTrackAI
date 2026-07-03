"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, LogOut } from "lucide-react";
import { useState } from "react";

import { useCurrentUser, useLogoutMutation } from "@/features/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ACCOUNT_NAV, MAIN_NAV } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

export type SidebarProps = {
  className?: string;
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useAppStore();
  const { user } = useCurrentUser();
  const logoutMutation = useLogoutMutation();
  const isAccountActive = ACCOUNT_NAV.children.some((item) => pathname.startsWith(item.href));
  const [isAccountOpen, setIsAccountOpen] = useState(isAccountActive);

  return (
    <aside
      className={cn(
        "hidden h-screen flex-col border-r border-border bg-card transition-all duration-300 lg:flex",
        isSidebarCollapsed ? "w-16" : "w-60",
        className,
      )}
    >
      <div
        className={cn(
          "flex border-b border-border",
          isSidebarCollapsed
            ? "h-16 flex-col items-center justify-center gap-0.5 px-1"
            : "h-16 items-center justify-between px-4",
        )}
      >
        <Link
          href="/dashboard"
          className={cn("flex min-w-0 items-center", isSidebarCollapsed && "justify-center")}
          aria-label="JobTrack AI"
        >
          {isSidebarCollapsed ? (
            <Image
              src="/brand/logo-mark.svg"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7"
              aria-hidden
            />
          ) : (
            <Image
              src="/brand/logo.svg"
              alt="JobTrack AI"
              width={148}
              height={32}
              className="h-8 w-auto"
              priority
            />
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className={cn(isSidebarCollapsed && "h-7 w-7")}
          onClick={toggleSidebarCollapsed}
          aria-label={isSidebarCollapsed ? "Expandir sidebar" : "Recolher sidebar"}
        >
          <ChevronLeft
            className={cn("h-4 w-4 transition-transform", isSidebarCollapsed && "rotate-180")}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3" aria-label="Navegação principal">
        {MAIN_NAV.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              aria-label={isSidebarCollapsed ? item.label : undefined}
              title={isSidebarCollapsed ? item.label : undefined}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
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

        {!isSidebarCollapsed ? (
          <button
            type="button"
            onClick={() => setIsAccountOpen((open) => !open)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isAccountActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <ACCOUNT_NAV.icon className="h-5 w-5 shrink-0" />
            <span className="flex-1 text-left">{ACCOUNT_NAV.label}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isAccountOpen && "rotate-180")} />
          </button>
        ) : (
          <Link
            href="/profile"
            className={cn(
              "flex cursor-pointer items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-colors",
              isAccountActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
            aria-label={ACCOUNT_NAV.label}
          >
            <ACCOUNT_NAV.icon className="h-5 w-5 shrink-0" />
          </Link>
        )}

        {!isSidebarCollapsed && isAccountOpen
          ? ACCOUNT_NAV.children.map((item) => {
              const isActive = pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "ml-3 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })
          : null}
      </nav>

      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2",
            isSidebarCollapsed && "justify-center",
          )}
        >
          <Avatar className="h-9 w-9">
            {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
            <AvatarFallback>{getInitials(user?.name ?? "User")}</AvatarFallback>
          </Avatar>
          {!isSidebarCollapsed ? (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">{user?.name ?? "Usuário"}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
            </div>
          ) : null}
          {!isSidebarCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Sair"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>
    </aside>
  );
};
