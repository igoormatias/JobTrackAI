import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../../../../../shared/errors/validation-error.js";
import type { ConnectGoogleCalendarUseCase } from "../../../application/use-cases/connect-google-calendar.use-case.js";
import type { DisconnectCalendarUseCase } from "../../../application/use-cases/disconnect-calendar.use-case.js";
import type { GetCalendarDebugUseCase } from "../../../application/use-cases/get-calendar-debug.use-case.js";
import type { GetCalendarStatusUseCase } from "../../../application/use-cases/get-calendar-status.use-case.js";
import type { GetGoogleCalendarAuthUrlUseCase } from "../../../application/use-cases/get-google-calendar-auth-url.use-case.js";
import type { ListCalendarEventsUseCase } from "../../../application/use-cases/list-calendar-events.use-case.js";
import type { SyncCalendarUseCase } from "../../../application/use-cases/sync-calendar.use-case.js";
import type { DismissCalendarPromptUseCase } from "../../../application/use-cases/dismiss-calendar-prompt.use-case.js";
import {
  googleCallbackSchema,
  listCalendarEventsQuerySchema,
} from "../schemas/calendar.schemas.js";

export class CalendarController {
  constructor(
    private readonly getCalendarStatusUseCase: GetCalendarStatusUseCase,
    private readonly getGoogleCalendarAuthUrlUseCase: GetGoogleCalendarAuthUrlUseCase,
    private readonly connectGoogleCalendarUseCase: ConnectGoogleCalendarUseCase,
    private readonly disconnectCalendarUseCase: DisconnectCalendarUseCase,
    private readonly listCalendarEventsUseCase: ListCalendarEventsUseCase,
    private readonly dismissCalendarPromptUseCase: DismissCalendarPromptUseCase,
    private readonly syncCalendarUseCase: SyncCalendarUseCase,
    private readonly getCalendarDebugUseCase: GetCalendarDebugUseCase,
  ) {}

  getStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ValidationError("User not authenticated");

      const response = await this.getCalendarStatusUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getGoogleAuthUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ValidationError("User not authenticated");

      const response = this.getGoogleCalendarAuthUrlUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  connectGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = googleCallbackSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = req.auth?.userId;
      if (!userId) throw new ValidationError("User not authenticated");

      const response = await this.connectGoogleCalendarUseCase.execute(userId, parsed.data.code);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  disconnectGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ValidationError("User not authenticated");

      const response = await this.disconnectCalendarUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  syncCalendar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ValidationError("User not authenticated");

      const response = await this.syncCalendarUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  listEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = listCalendarEventsQuerySchema.safeParse(req.query);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = req.auth?.userId;
      if (!userId) throw new ValidationError("User not authenticated");

      const response = await this.listCalendarEventsUseCase.execute(
        userId,
        new Date(parsed.data.from),
        new Date(parsed.data.to),
      );
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  dismissPrompt = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ValidationError("User not authenticated");

      await this.dismissCalendarPromptUseCase.execute(userId);
      res.status(200).json({ message: "Calendar prompt dismissed" });
    } catch (error) {
      next(error);
    }
  };

  getDebug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.auth?.userId;
      if (!userId) throw new ValidationError("User not authenticated");

      const response = await this.getCalendarDebugUseCase.execute(userId);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
