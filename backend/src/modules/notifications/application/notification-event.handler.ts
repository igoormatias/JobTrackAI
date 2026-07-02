import type { DomainEvent } from "../../../shared/domain/domain-event.js";
import { PIPELINE_STAGE_LABELS } from "../../../shared/domain/pipeline-stage.js";
import type { NotificationService } from "./notification.service.js";
import {
  InterviewReminderEvent,
  JobFavoritedEvent,
  PriorityChangedEvent,
  ProcessCreatedEvent,
  StatusChangedEvent,
} from "../domain/events/notification-events.js";

const stageLabel = (stage: string): string =>
  PIPELINE_STAGE_LABELS[stage as keyof typeof PIPELINE_STAGE_LABELS] ?? stage;

export class NotificationEventHandler {
  constructor(private readonly notificationService: NotificationService) {}

  register(eventBus: { subscribe: (eventName: string, handler: (event: DomainEvent) => Promise<void>) => void }): void {
    eventBus.subscribe("process_created", (event) => this.onProcessCreated(event));
    eventBus.subscribe("status_changed", (event) => this.onStatusChanged(event));
    eventBus.subscribe("job_favorited", (event) => this.onJobFavorited(event));
    eventBus.subscribe("priority_changed", (event) => this.onPriorityChanged(event));
    eventBus.subscribe("interview_reminder", (event) => this.onInterviewReminder(event));
  }

  private async onProcessCreated(event: DomainEvent): Promise<void> {
    if (!(event instanceof ProcessCreatedEvent)) return;

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "pipeline_change",
      title: "Processo adicionado",
      message: `${event.payload.jobTitle} · ${event.payload.companyName} entrou no seu pipeline.`,
      actionUrl: `/pipeline`,
      metadata: {
        trackingId: event.payload.trackingId,
      },
    });
  }

  private async onStatusChanged(event: DomainEvent): Promise<void> {
    if (!(event instanceof StatusChangedEvent)) return;

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "pipeline_change",
      title: "Status alterado",
      message: `${event.payload.jobTitle}: ${stageLabel(event.payload.fromStage)} → ${stageLabel(event.payload.toStage)}.`,
      actionUrl: `/pipeline`,
      metadata: {
        trackingId: event.payload.trackingId,
        fromStage: event.payload.fromStage,
        toStage: event.payload.toStage,
      },
    });
  }

  private async onJobFavorited(event: DomainEvent): Promise<void> {
    if (!(event instanceof JobFavoritedEvent)) return;
    if (!event.payload.isFavorite) return;

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "pipeline_change",
      title: "Vaga favoritada",
      message: `${event.payload.jobTitle} · ${event.payload.companyName} foi marcada como favorita.`,
      actionUrl: `/jobs`,
      metadata: {
        trackingId: event.payload.trackingId,
      },
    });
  }

  private async onPriorityChanged(event: DomainEvent): Promise<void> {
    if (!(event instanceof PriorityChangedEvent)) return;

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "pipeline_change",
      title: "Prioridade alterada",
      message: `${event.payload.jobTitle} agora está com prioridade ${event.payload.priority}.`,
      actionUrl: `/pipeline`,
      metadata: {
        trackingId: event.payload.trackingId,
        priority: event.payload.priority,
      },
    });
  }

  private async onInterviewReminder(event: DomainEvent): Promise<void> {
    if (!(event instanceof InterviewReminderEvent)) return;

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "interview_reminder",
      title: "Entrevista próxima",
      message: `${event.payload.jobTitle} · ${event.payload.companyName} — ${new Date(event.payload.scheduledAt).toLocaleString("pt-BR")}.`,
      actionUrl: `/pipeline`,
      metadata: {
        trackingId: event.payload.trackingId,
        interviewId: event.payload.interviewId,
        scheduledAt: event.payload.scheduledAt,
      },
    });
  }
}
