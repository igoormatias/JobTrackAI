import { subHours } from "date-fns";

import type { Application, Job, Notification, NotificationCategory, NotificationType } from "@/types";

import { sortJobsByMatchAndDate } from "./job-sorter";
import type { RecommendationProfile } from "../types/recommendation.types";

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

export type BuildNotificationsInput = {
  userId: string;
  jobs: Job[];
  applications: Application[];
  profile: RecommendationProfile;
};

const getRelevantJobs = (jobs: Job[], profile: RecommendationProfile): Job[] => {
  const sorted = sortJobsByMatchAndDate(jobs);

  return sorted.filter((job) => {
    if (profile.area && job.area !== profile.area) return false;
    if (job.matchScore.score < 60) return false;

    if (profile.skillNames.length === 0) return true;

    const jobTechs = job.technologies.map((tech) => tech.name.toLowerCase());
    return profile.skillNames.some((skill) =>
      jobTechs.some((tech) => tech.includes(skill.toLowerCase()) || skill.toLowerCase().includes(tech)),
    );
  });
};

export const buildPersonalizedNotifications = ({
  userId,
  jobs,
  applications,
  profile,
}: BuildNotificationsInput): Notification[] => {
  const relevantJobs = getRelevantJobs(jobs, profile);
  const notifications: Notification[] = [];
  let index = 1;

  relevantJobs.slice(0, 5).forEach((job) => {
    const primarySkill =
      profile.skillNames.find((skill) =>
        job.technologies.some((tech) => tech.name.toLowerCase().includes(skill.toLowerCase())),
      ) ?? job.technologies[0]?.name ?? "compatível";

    notifications.push({
      id: `notification_${String(index).padStart(4, "0")}`,
      userId,
      type: "new_job",
      category: TYPE_TO_CATEGORY.new_job,
      title: "Nova vaga encontrada",
      message: `Nova vaga ${primarySkill} encontrada — ${job.title} na ${job.company.name}.`,
      read: index > 3,
      actionUrl: `/jobs/${job.id}`,
      metadata: { jobId: job.id, matchScore: job.matchScore.score },
      createdAt: subHours(new Date(), index * 2).toISOString(),
    });
    index += 1;
  });

  relevantJobs.slice(0, 3).forEach((job) => {
    notifications.push({
      id: `notification_${String(index).padStart(4, "0")}`,
      userId,
      type: "recommendation",
      category: TYPE_TO_CATEGORY.recommendation,
      title: "Nova recomendação",
      message: `Encontramos uma vaga com ${job.matchScore.score}% de match — ${job.title}.`,
      read: index > 5,
      actionUrl: `/jobs/${job.id}`,
      metadata: { jobId: job.id, matchScore: job.matchScore.score },
      createdAt: subHours(new Date(), index * 3).toISOString(),
    });
    index += 1;
  });

  applications.slice(0, 4).forEach((app, appIndex) => {
    const types: NotificationType[] = ["pipeline_change", "interview_reminder"];
    const type = types[appIndex % types.length]!;

    notifications.push({
      id: `notification_${String(index).padStart(4, "0")}`,
      userId,
      type,
      category: TYPE_TO_CATEGORY[type],
      title: type === "pipeline_change" ? "Atualização no pipeline" : "Próxima entrevista",
      message:
        type === "pipeline_change"
          ? `Sua candidatura para ${app.job.title} avançou de etapa.`
          : `Entrevista agendada para ${app.job.title} na ${app.job.company.name}.`,
      read: index > 8,
      actionUrl: "/pipeline",
      metadata: { applicationId: app.id },
      createdAt: subHours(new Date(), index * 4).toISOString(),
    });
    index += 1;
  });

  notifications.push({
    id: `notification_${String(index).padStart(4, "0")}`,
    userId,
    type: "dashboard_update",
    category: TYPE_TO_CATEGORY.dashboard_update,
    title: "Dashboard atualizado",
    message: `Encontramos ${relevantJobs.length} vagas compatíveis com seu perfil.`,
    read: false,
    actionUrl: "/dashboard",
    metadata: { compatibleJobs: relevantJobs.length },
    createdAt: subHours(new Date(), 1).toISOString(),
  });

  return notifications;
};
