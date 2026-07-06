import type { EventBus } from "../../../shared/events/event-bus.interface.js";
import type {
  CreateNotificationInput,
  DeleteNotificationsInput,
  MarkNotificationsReadInput,
  NotificationListParams,
} from "../domain/entities/notification.entity.js";
import type { NotificationRepository } from "../domain/repositories/notification.repository.js";
import { NotificationCreatedEvent } from "../domain/events/notification-events.js";
import { NotFoundError } from "../../../shared/errors/not-found-error.js";

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly eventBus?: EventBus,
  ) {}

  list(userId: string, params: NotificationListParams = {}) {
    return this.repository.listByUserId(userId, params);
  }

  countUnread(userId: string) {
    return this.repository.countUnread(userId);
  }

  markAsRead(input: MarkNotificationsReadInput) {
    return this.repository.markAsRead(input);
  }

  async softDelete(userId: string, id: string) {
    const deleted = await this.repository.softDelete(userId, id);
    if (!deleted) {
      throw new NotFoundError("Notification not found");
    }
  }

  softDeleteMany(input: DeleteNotificationsInput) {
    return this.repository.softDeleteMany(input);
  }

  async create(input: CreateNotificationInput) {
    const entity = await this.repository.create(input);

    if (this.eventBus) {
      await this.eventBus.publish(
        new NotificationCreatedEvent({
          userId: input.userId,
          notificationId: entity.id,
          type: input.type,
        }),
      );
    }

    return entity;
  }
}
