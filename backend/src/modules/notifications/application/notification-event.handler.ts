import type { DomainEvent } from "../../../shared/domain/domain-event.js";
import { PIPELINE_STAGE_LABELS } from "../../../shared/domain/pipeline-stage.js";
import type { NotificationService } from "./notification.service.js";
import {
  FavoriteCompanyJobEvent,
  FollowupReminderEvent,
  InterviewReminderEvent,
  JobFavoritedEvent,
  PriorityChangedEvent,
  ProcessCreatedEvent,
  StatusChangedEvent,
  SyncCompleteEvent,
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
    eventBus.subscribe("followup_reminder", (event) => this.onFollowupReminder(event));
    eventBus.subscribe("sync_complete", (event) => this.onSyncComplete(event));
    eventBus.subscribe("favorite_company_job", (event) => this.onFavoriteCompanyJob(event));
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
      type: "favorite_company",
      title: "Empresa favorita",
      message: `${event.payload.jobTitle} · ${event.payload.companyName} foi salva. Vagas futuras desta empresa serão destacadas.`,
      actionUrl: `/jobs`,
      metadata: {
        trackingId: event.payload.trackingId,
        companyName: event.payload.companyName,
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

    const title =
      event.payload.reminderKind === "24h" ? "Entrevista amanhã" : "Entrevista em breve";

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "interview_reminder",
      title,
      message: `${event.payload.jobTitle} · ${event.payload.companyName} — ${new Date(event.payload.scheduledAt).toLocaleString("pt-BR")}.`,
      actionUrl: `/pipeline`,
      metadata: {
        trackingId: event.payload.trackingId,
        interviewId: event.payload.interviewId,
        scheduledAt: event.payload.scheduledAt,
        reminderKind: event.payload.reminderKind,
      },
    });
  }

  private async onFollowupReminder(event: DomainEvent): Promise<void> {
    if (!(event instanceof FollowupReminderEvent)) return;

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "followup_reminder",
      title: "Hora de fazer follow-up",
      message: `${event.payload.jobTitle} · ${event.payload.companyName} está há ${event.payload.daysIdle} dias em ${stageLabel(event.payload.stage)}.`,
      actionUrl: `/pipeline`,
      metadata: {
        trackingId: event.payload.trackingId,
        stage: event.payload.stage,
        daysIdle: event.payload.daysIdle,
      },
    });
  }

  private async onSyncComplete(event: DomainEvent): Promise<void> {
    if (!(event instanceof SyncCompleteEvent)) return;
    if (event.payload.importedCount <= 0) return;

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "sync_complete",
      title: "Sincronização concluída",
      message: `${event.payload.providerName}: ${event.payload.importedCount} novas vagas de ${event.payload.foundCount} encontradas.`,
      actionUrl: `/jobs`,
      metadata: {
        providerName: event.payload.providerName,
        importedCount: event.payload.importedCount,
        foundCount: event.payload.foundCount,
      },
    });
  }

  private async onFavoriteCompanyJob(event: DomainEvent): Promise<void> {
    if (!(event instanceof FavoriteCompanyJobEvent)) return;

    await this.notificationService.create({
      userId: event.payload.userId,
      type: "favorite_company",
      title: "Nova vaga de empresa favorita",
      message: `${event.payload.jobTitle} · ${event.payload.companyName} acabou de ser publicada.`,
      actionUrl: `/jobs/${event.payload.jobId}`,
      metadata: {
        jobId: event.payload.jobId,
        companyName: event.payload.companyName,
        matchScore: event.payload.matchScore ?? null,
      },
    });
  }
}
