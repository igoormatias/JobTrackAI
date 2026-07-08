import { subHours } from "date-fns";
import { faker } from "@faker-js/faker";

import type { Notification, NotificationCategory, NotificationType } from "@/types";

import { createId } from "../utils/mock-utils";

const TYPE_TO_CATEGORY: Record<NotificationType, NotificationCategory> = {
  new_job: "jobs",
  recommendation: "jobs",
  job_closed: "alerts",
  pipeline_change: "pipeline",
  interview_reminder: "calendar",
  dashboard_update: "system",
  favorite_company: "favorites",
  followup_reminder: "followup",
  sync_complete: "system",
  alert: "alerts",
};

export type CreateNotificationInput = {
  index: number;
  userId: string;
  type: NotificationType;
  title?: string;
  message?: string;
  read?: boolean;
};

const notificationDefaults: Record<
  NotificationType,
  { title: string; message: string; actionUrl: string }
> = {
  new_job: {
    title: "Nova vaga encontrada",
    message: "Uma nova vaga de React Developer foi publicada.",
    actionUrl: "/jobs",
  },
  recommendation: {
    title: "Nova recomendação",
    message: "Encontramos uma vaga com 94% de match para você.",
    actionUrl: "/jobs",
  },
  pipeline_change: {
    title: "Atualização no pipeline",
    message: "Sua candidatura avançou para Entrevista Técnica.",
    actionUrl: "/pipeline",
  },
  interview_reminder: {
    title: "Próxima entrevista",
    message: "Entrevista técnica amanhã às 14h.",
    actionUrl: "/pipeline",
  },
  dashboard_update: {
    title: "Dashboard atualizado",
    message: "Novos KPIs e atividades disponíveis.",
    actionUrl: "/dashboard",
  },
  job_closed: {
    title: "Vaga encerrada",
    message: "Uma vaga que você acompanha não está mais disponível na origem.",
    actionUrl: "/jobs",
  },
  favorite_company: {
    title: "Empresa favorita",
    message: "Nova vaga publicada por uma empresa que você salvou.",
    actionUrl: "/jobs",
  },
  followup_reminder: {
    title: "Hora de fazer follow-up",
    message: "Um processo está há vários dias sem atualização.",
    actionUrl: "/pipeline",
  },
  sync_complete: {
    title: "Sincronização concluída",
    message: "Novas vagas foram importadas dos provedores.",
    actionUrl: "/jobs",
  },
  alert: {
    title: "Alerta",
    message: "Há um alerta importante sobre seu acompanhamento.",
    actionUrl: "/notifications",
  },
};

export const createNotification = ({
  index,
  userId,
  type,
  title,
  message,
  read = false,
}: CreateNotificationInput): Notification => {
  const defaults = notificationDefaults[type];

  return {
    id: createId("notification", index),
    userId,
    type,
    category: TYPE_TO_CATEGORY[type],
    title: title ?? defaults.title,
    message: message ?? defaults.message,
    read,
    actionUrl: defaults.actionUrl,
    metadata: { source: faker.helpers.arrayElement(["system", "ai", "pipeline"]) },
    createdAt: subHours(new Date(), index * 3).toISOString(),
  };
};
