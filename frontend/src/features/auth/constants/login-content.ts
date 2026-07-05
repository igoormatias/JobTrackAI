import type { LucideIcon } from "lucide-react";
import { Brain, CalendarDays, Kanban, LayoutDashboard } from "lucide-react";

export const LOGIN_HERO = {
  eyebrow: "Career Tracker com IA",
  title: "Organize sua carreira.",
  highlight: "Encontre oportunidades com Inteligência Artificial.",
  subtitle:
    "Acompanhe processos seletivos, organize entrevistas, receba recomendações inteligentes e evolua sua carreira em um único lugar.",
} as const;

export type LoginProductPreview = {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
};

export const LOGIN_PRODUCT_PREVIEWS: LoginProductPreview[] = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    description: "KPIs e prioridades da sua busca em um só lugar.",
    accent: "from-blue-500/20 to-indigo-500/10",
  },
  {
    icon: Kanban,
    title: "Pipeline",
    description: "Kanban visual para cada processo seletivo.",
    accent: "from-violet-500/20 to-purple-500/10",
  },
  {
    icon: Brain,
    title: "IA de Carreira",
    description: "Match inteligente e análises sob demanda.",
    accent: "from-cyan-500/20 to-blue-500/10",
  },
  {
    icon: CalendarDays,
    title: "Calendário",
    description: "Entrevistas centralizadas com sync no Google.",
    accent: "from-emerald-500/20 to-teal-500/10",
  },
];

export const AUTH_LOADING_MESSAGES = [
  "Entrando...",
  "Preparando seu ambiente...",
  "Carregando seu perfil...",
] as const;
