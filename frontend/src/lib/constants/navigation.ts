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

export const MAIN_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Vagas", icon: Briefcase },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/profile", label: "Perfil", icon: User },
];

export const SECONDARY_NAV: NavItem[] = [
  { href: "/settings", label: "Ajustes", icon: Settings },
];
