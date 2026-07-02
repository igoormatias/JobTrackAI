import type { Notification as PrismaNotification } from "@prisma/client";
import { Prisma } from "@prisma/client";

import { prisma } from "../../../../database/prisma.js";
import { paginateWithCursor } from "../../../../shared/http/cursor-pagination.js";
import type {
  CreateNotificationInput,
  MarkNotificationsReadInput,
  NotificationEntity,
  NotificationListParams,
  NotificationType,
} from "../../domain/entities/notification.entity.js";
import type { NotificationRepository } from "../../domain/repositories/notification.repository.js";

const toMetadataRecord = (
  metadata: Prisma.JsonValue | null,
): Record<string, string | number | boolean | null> => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata as Record<string, string | number | boolean | null>;
};

export class NotificationMapper {
  static toEntity(record: PrismaNotification): NotificationEntity {
    const metadata = toMetadataRecord(record.metadata);

    return {
      id: record.id,
      userId: record.userId,
      type: record.type as NotificationType,
      title: record.title,
      message: record.message,
      read: record.readAt !== null,
      actionUrl: typeof metadata.actionUrl === "string" ? metadata.actionUrl : null,
      metadata,
      createdAt: record.createdAt.toISOString(),
    };
  }
}

export class PrismaNotificationRepository implements NotificationRepository {
  async create(input: CreateNotificationInput): Promise<NotificationEntity> {
    const metadata: Prisma.InputJsonValue = {
      ...(input.metadata ?? {}),
      ...(input.actionUrl ? { actionUrl: input.actionUrl } : {}),
    };

    const record = await prisma.notification.create({
      data: {
        userId: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        metadata,
      },
    });

    return NotificationMapper.toEntity(record);
  }

  async listByUserId(userId: string, params: NotificationListParams) {
    const where: Prisma.NotificationWhereInput = { userId };

    if (params.read === true) {
      where.readAt = { not: null };
    } else if (params.read === false) {
      where.readAt = null;
    }

    if (params.type) {
      where.type = params.type;
    }

    const records = await prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    const entities = records.map((record) => NotificationMapper.toEntity(record));

    return paginateWithCursor(entities, {
      cursor: params.cursor,
      limit: params.limit ?? 20,
      getId: (item) => item.id,
      getSortValue: (item) => item.createdAt,
    });
  }

  async markAsRead(input: MarkNotificationsReadInput): Promise<number> {
    const now = new Date();

    if (input.all) {
      const result = await prisma.notification.updateMany({
        where: { userId: input.userId, readAt: null },
        data: { readAt: now },
      });
      return result.count;
    }

    if (!input.ids?.length) {
      return 0;
    }

    const result = await prisma.notification.updateMany({
      where: {
        userId: input.userId,
        id: { in: input.ids },
        readAt: null,
      },
      data: { readAt: now },
    });

    return result.count;
  }
}

export const prismaNotificationRepository = new PrismaNotificationRepository();
