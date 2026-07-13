import {
  addWeeks,
  endOfWeek,
  format,
  isThisWeek,
  isToday,
  isTomorrow,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";

export const parseLocalDayKey = (dayKey: string): Date => {
  const [year, month, day] = dayKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getAgendaGroupLabel = (date: Date): string => {
  if (isToday(date)) return "Hoje";
  if (isTomorrow(date)) return "Amanhã";
  if (isThisWeek(date, { weekStartsOn: 1 })) return "Esta semana";
  const nextWeekStart = addWeeks(startOfWeek(new Date(), { weekStartsOn: 1 }), 1);
  const nextWeekEnd = endOfWeek(nextWeekStart, { weekStartsOn: 1 });
  if (date >= nextWeekStart && date <= nextWeekEnd) return "Próxima semana";
  return format(date, "EEEE, d 'de' MMMM", { locale: ptBR });
};
