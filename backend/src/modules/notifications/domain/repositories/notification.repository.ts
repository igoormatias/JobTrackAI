import type {
  CreateNotificationInput,
  DeleteNotificationsInput,
  MarkNotificationsReadInput,
  NotificationEntity,
  NotificationListParams,
} from "../entities/notification.entity.js";
import type { CursorPaginatedResult } from "../../../../shared/http/cursor-pagination.js";

export interface NotificationRepository {
  create(input: CreateNotificationInput): Promise<NotificationEntity>;
  listByUserId(
    userId: string,
    params: NotificationListParams,
  ): Promise<CursorPaginatedResult<NotificationEntity>>;
  markAsRead(input: MarkNotificationsReadInput): Promise<number>;
  countUnread(userId: string): Promise<number>;
  softDelete(userId: string, id: string): Promise<boolean>;
  softDeleteMany(input: DeleteNotificationsInput): Promise<number>;
}
