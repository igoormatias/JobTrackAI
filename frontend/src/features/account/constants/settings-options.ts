import type { RefreshFrequency } from "@/types";

export const THEME_OPTIONS = [
  { value: "dark" as const, label: "Escuro" },
  { value: "light" as const, label: "Claro" },
  { value: "system" as const, label: "Sistema" },
];

export const REFRESH_FREQUENCY_OPTIONS: { value: RefreshFrequency; label: string }[] = [
  { value: "15m", label: "A cada 15 minutos" },
  { value: "30m", label: "A cada 30 minutos" },
  { value: "1h", label: "A cada 1 hora" },
  { value: "2h", label: "A cada 2 horas" },
  { value: "manual", label: "Até fechar manualmente" },
];
