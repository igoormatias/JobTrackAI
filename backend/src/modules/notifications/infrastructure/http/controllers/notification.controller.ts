import type { NextFunction, Request, Response } from "express";

import { getAuthUserId } from "../../../../../shared/http/get-auth-user-id.js";
import { getRouteParam } from "../../../../../shared/http/get-route-param.js";
import { ValidationError } from "../../../../../shared/errors/validation-error.js";
import type { NotificationService } from "../../../application/notification.service.js";
import {
  deleteNotificationsSchema,
  markNotificationsReadSchema,
  notificationListQuerySchema,
} from "../schemas/notification.schema.js";

export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  listNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = notificationListQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const userId = getAuthUserId(req);
      const result = await this.notificationService.list(userId, parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const count = await this.notificationService.countUnread(userId);
      res.status(200).json({ data: { count } });
    } catch (error) {
      next(error);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = markNotificationsReadSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const userId = getAuthUserId(req);
      const updated = await this.notificationService.markAsRead({
        userId,
        ids: parsed.data.ids,
        all: parsed.data.all,
      });

      res.status(200).json({
        data: { updated },
        message: "Notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  };

  deleteOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      await this.notificationService.softDelete(userId, id);
      res.status(200).json({ message: "Notification deleted" });
    } catch (error) {
      next(error);
    }
  };

  deleteMany = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = deleteNotificationsSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const userId = getAuthUserId(req);
      const deleted = await this.notificationService.softDeleteMany({
        userId,
        ids: parsed.data.ids,
      });

      res.status(200).json({
        data: { deleted },
        message: "Notifications deleted",
      });
    } catch (error) {
      next(error);
    }
  };
}
