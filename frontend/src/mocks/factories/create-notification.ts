import { subHours } from "date-fns";
import { faker } from "@faker-js/faker";

import type { Notification, NotificationType } from "@/types";

import { createId } from "../utils/mock-utils";

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
    title: title ?? defaults.title,
    message: message ?? defaults.message,
    read,
    actionUrl: defaults.actionUrl,
    metadata: { source: faker.helpers.arrayElement(["system", "ai", "pipeline"]) },
    createdAt: subHours(new Date(), index * 3).toISOString(),
  };
};
