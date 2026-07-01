"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Search, Settings, User } from "lucide-react";
import { type ReactNode, useState } from "react";

import { useCurrentUser, useLogoutMutation } from "@/features/auth";
import { HeaderNotificationButton } from "@/features/notifications/components/HeaderNotificationButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownTrigger,
} from "@/components/ui/Dropdown";
import { SearchInput } from "@/components/ui/SearchInput";
import { cn } from "@/lib/utils";

export type AppHeaderProps = {
  title?: string;
  showSearch?: boolean;
  actions?: ReactNode;
  className?: string;
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const getPageTitle = (pathname: string): string => {
  if (pathname.startsWith("/dashboard")) return "JobTrack AI";
  if (pathname.startsWith("/jobs")) return "Vagas";
  if (pathname.startsWith("/pipeline")) return "Pipeline";
  if (pathname.startsWith("/profile")) return "Perfil";
  if (pathname.startsWith("/settings")) return "Configurações";
  return "JobTrack AI";
};

export const AppHeader = ({
  title,
  showSearch = true,
  actions,
  className,
}: AppHeaderProps) => {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const logoutMutation = useLogoutMutation();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const displayTitle = title ?? getPageTitle(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        className,
      )}
    >
      <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="flex items-center justify-between gap-3 lg:justify-start">
          <h1 className="text-lg font-bold text-foreground lg:text-xl">{displayTitle}</h1>

          <div className="flex items-center gap-2 lg:hidden">
            {showSearch ? (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Abrir busca"
                aria-expanded={mobileSearchOpen}
                onClick={() => setMobileSearchOpen((open) => !open)}
              >
                <Search className="h-5 w-5" aria-hidden="true" />
              </Button>
            ) : null}
            <HeaderNotificationButton />
            <Dropdown>
              <DropdownTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Perfil
                  </Link>
                </DropdownItem>
                <DropdownItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Configurações
                  </Link>
                </DropdownItem>
                <DropdownSeparator />
                <DropdownItem
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownItem>
              </DropdownContent>
            </Dropdown>
          </div>
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {showSearch ? (
            <SearchInput placeholder="Buscar vagas, empresas..." className="w-64" aria-label="Busca global" />
          ) : null}
          {actions}
          <HeaderNotificationButton />
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" aria-label="Menu do usuário">
                <Avatar className="h-9 w-9">
                  {user?.avatar ? <AvatarImage src={user.avatar} alt={user.name} /> : null}
                  <AvatarFallback>{getInitials(user?.name ?? "User")}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownTrigger>
            <DropdownContent align="end" className="w-48">
              <DropdownItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  Perfil
                </Link>
              </DropdownItem>
              <DropdownItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownItem>
              <DropdownSeparator />
              <DropdownItem
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </div>

      {showSearch && mobileSearchOpen ? (
        <div className="border-t border-border px-4 pb-4 lg:hidden">
          <SearchInput placeholder="Buscar vagas, empresas..." aria-label="Busca global" />
        </div>
      ) : null}
    </header>
  );
};
