"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { MAIN_NAV, MOBILE_ACCOUNT_NAV } from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

export type BottomNavProps = {
  className?: string;
};

const MOBILE_NAV = [...MAIN_NAV, MOBILE_ACCOUNT_NAV];

export const BottomNav = ({ className }: BottomNavProps) => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card pb-safe lg:hidden",
        className,
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map((item) => {
          const isActive =
            item.href === "/profile"
              ? pathname.startsWith("/profile") ||
                pathname.startsWith("/settings") ||
                pathname.startsWith("/resume")
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
