import {
  Briefcase,
  Kanban,
  LayoutDashboard,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type NavGroup = {
  label: string;
  icon: LucideIcon;
  children: NavItem[];
};

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Vagas", icon: Briefcase },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
];

export const ACCOUNT_NAV: NavGroup = {
  label: "Minha Conta",
  icon: User,
  children: [
    { href: "/profile", label: "Perfil", icon: User },
    { href: "/settings", label: "Preferências", icon: Settings },
  ],
};

export const MOBILE_ACCOUNT_NAV: NavItem = {
  href: "/profile",
  label: "Conta",
  icon: User,
};
