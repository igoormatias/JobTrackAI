import type {
  CreateNotificationInput,
  MarkNotificationsReadInput,
  NotificationListParams,
} from "../domain/entities/notification.entity.js";
import type { NotificationRepository } from "../domain/repositories/notification.repository.js";

export class NotificationService {
  constructor(private readonly repository: NotificationRepository) {}

  list(userId: string, params: NotificationListParams = {}) {
    return this.repository.listByUserId(userId, params);
  }

  markAsRead(input: MarkNotificationsReadInput) {
    return this.repository.markAsRead(input);
  }

  create(input: CreateNotificationInput) {
    return this.repository.create(input);
  }
}
