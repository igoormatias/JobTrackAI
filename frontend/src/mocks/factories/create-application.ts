import { addDays, subDays } from "date-fns";

import type { Application, Job, PipelineStage } from "@/types";

import { createId } from "../utils/mock-utils";
import { createTimelineEvent } from "./create-timeline-event";

export type CreateApplicationInput = {
  index: number;
  userId: string;
  job: Job;
  stage: PipelineStage;
};

const buildTimelineForStage = (applicationId: string, stage: PipelineStage, appliedAt: string) => {
  const events = [
    createTimelineEvent({
      applicationId,
      index: 1,
      type: "created",
      title: "Vaga favoritada",
      occurredAt: subDays(new Date(appliedAt), 2).toISOString(),
    }),
    createTimelineEvent({
      applicationId,
      index: 2,
      type: "applied",
      title: "Candidatura enviada",
      occurredAt: appliedAt,
    }),
  ];

  if (stage !== "favorite" && stage !== "applied") {
    events.push(
      createTimelineEvent({
        applicationId,
        index: 3,
        type: "stage_changed",
        title: "Avançou para RH",
        occurredAt: addDays(new Date(appliedAt), 2).toISOString(),
      }),
    );
  }

  if (["technical_interview", "manager", "client", "offer"].includes(stage)) {
    events.push(
      createTimelineEvent({
        applicationId,
        index: 4,
        type: "interview_scheduled",
        title: "Entrevista técnica agendada",
        occurredAt: addDays(new Date(appliedAt), 5).toISOString(),
        metadata: { format: "remoto" },
      }),
    );
  }

  if (stage === "offer") {
    events.push(
      createTimelineEvent({
        applicationId,
        index: 5,
        type: "offer_received",
        title: "Proposta recebida",
        occurredAt: addDays(new Date(appliedAt), 12).toISOString(),
      }),
    );
  }

  if (stage === "rejected") {
    events.push(
      createTimelineEvent({
        applicationId,
        index: 6,
        type: "rejected",
        title: "Processo encerrado",
        description: "Feedback: seguir estudando cloud e mensageria.",
        occurredAt: addDays(new Date(appliedAt), 8).toISOString(),
      }),
    );
  }

  return events;
};

export const createApplication = ({ index, userId, job, stage }: CreateApplicationInput): Application => {
  const id = createId("application", index);
  const appliedAt = subDays(new Date(), index + 1).toISOString();
  const hasInterview = ["technical_interview", "manager", "client", "offer"].includes(stage);

  return {
    id,
    jobId: job.id,
    companyId: job.companyId,
    userId,
    stage,
    status: "active",
    notes: stage === "rejected" ? "Aguardar retorno em 6 meses." : null,
    nextStep:
      stage === "technical_interview"
        ? "Preparar live coding"
        : stage === "hr"
          ? "Enviar teste comportamental"
          : null,
    nextInterviewAt: hasInterview ? addDays(new Date(), index % 5 + 1).toISOString() : null,
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      modality: job.modality,
      location: job.location,
      matchScore: job.matchScore,
    },
    timeline: buildTimelineForStage(id, stage, appliedAt),
    appliedAt,
    updatedAt: new Date().toISOString(),
  };
};
