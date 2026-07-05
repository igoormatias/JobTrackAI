"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

const ACCOUNT_TABS = [
  { href: "/profile", label: "Perfil", value: "profile" },
  { href: "/settings", label: "Preferências", value: "settings" },
  { href: "/settings?tab=integrations", label: "Integrações", value: "integrations" },
  { href: "/resume", label: "Currículo", value: "resume" },
] as const;

const getActiveTab = (pathname: string, tab: string | null): string => {
  if (pathname.startsWith("/settings") && tab === "integrations") return "integrations";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/resume")) return "resume";
  return "profile";
};

export const AccountTabsNav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = getActiveTab(pathname, searchParams.get("tab"));

  return (
    <nav aria-label="Minha Conta" className="w-full overflow-x-auto">
      <div
        role="tablist"
        className="inline-flex h-10 w-full min-w-0 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground sm:w-auto"
      >
        {ACCOUNT_TABS.map((tab) => {
          const isActive = activeTab === tab.value;

          return (
            <Link
              key={tab.value}
              href={tab.href}
              role="tab"
              aria-selected={isActive}
              className={cn(
                "inline-flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex-none",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
