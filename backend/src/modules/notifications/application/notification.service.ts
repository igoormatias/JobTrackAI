import type { EventBus } from "../../../shared/events/event-bus.interface.js";
import type {
  CreateNotificationInput,
  MarkNotificationsReadInput,
  NotificationListParams,
} from "../domain/entities/notification.entity.js";
import type { NotificationRepository } from "../domain/repositories/notification.repository.js";
import { NotificationCreatedEvent } from "../domain/events/notification-events.js";

export class NotificationService {
  constructor(
    private readonly repository: NotificationRepository,
    private readonly eventBus?: EventBus,
  ) {}

  list(userId: string, params: NotificationListParams = {}) {
    return this.repository.listByUserId(userId, params);
  }

  markAsRead(input: MarkNotificationsReadInput) {
    return this.repository.markAsRead(input);
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
