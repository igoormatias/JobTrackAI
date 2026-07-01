import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formatInterviewDate = (scheduledAt: string): string =>
  format(new Date(scheduledAt), "dd MMM yyyy", { locale: ptBR });

export const formatInterviewTime = (scheduledAt: string): string =>
  format(new Date(scheduledAt), "HH:mm", { locale: ptBR });
