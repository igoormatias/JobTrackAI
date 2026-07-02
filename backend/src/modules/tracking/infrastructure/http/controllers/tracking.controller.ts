import type { NextFunction, Request, Response } from "express";

import { getAuthUserId } from "../../../../../shared/http/get-auth-user-id.js";
import { getRouteParam } from "../../../../../shared/http/get-route-param.js";
import { ValidationError } from "../../../../../shared/errors/validation-error.js";
import { trackingService, type TrackingService } from "../../../application/tracking.service.js";
import {
  changePrioritySchema,
  changeVisibilitySchema,
  createInterviewSchema,
  createTrackingSchema,
  moveTrackingStageSchema,
  trackingListQuerySchema,
  updateInterviewSchema,
  updateNotesSchema,
  updateTimelineEventSchema,
} from "../schemas/tracking.schema.js";

export class TrackingController {
  constructor(private readonly service: TrackingService = trackingService) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = trackingListQuerySchema.safeParse(req.query);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const data = await this.service.listAsync(getAuthUserId(req), parsed.data);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.getById(userId, id);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createTrackingSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const data = await this.service.create({
        userId: getAuthUserId(req),
        ...parsed.data,
      });
      res.status(201).json({ data, message: "Tracking created" });
    } catch (error) {
      next(error);
    }
  };

  moveStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = moveTrackingStageSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.moveStage(userId, id, parsed.data);
      res.status(200).json({ data, message: "Stage updated" });
    } catch (error) {
      next(error);
    }
  };

  toggleFavorite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.toggleFavorite(userId, id);
      res.status(200).json({ data, message: "Favorite updated" });
    } catch (error) {
      next(error);
    }
  };

  changePriority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = changePrioritySchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.changePriority(userId, id, parsed.data.priority);
      res.status(200).json({ data, message: "Priority updated" });
    } catch (error) {
      next(error);
    }
  };

  changeVisibility = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = changeVisibilitySchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.setVisibility(userId, id, parsed.data.visibility);
      res.status(200).json({ data, message: "Visibility updated" });
    } catch (error) {
      next(error);
    }
  };

  updateNotes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateNotesSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.updateNotes(userId, id, parsed.data.notes);
      res.status(200).json({ data, message: "Notes updated" });
    } catch (error) {
      next(error);
    }
  };

  getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.getTimeline(userId, id);
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  updateTimelineEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateTimelineEventSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const eventId = getRouteParam(req, "eventId");
      const data = await this.service.updateTimelineEvent(userId, id, eventId, parsed.data);
      res.status(200).json({ data, message: "Timeline event updated" });
    } catch (error) {
      next(error);
    }
  };

  listInterviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = getRouteParam(req, "id");
      const data = await this.service.listInterviews(id, getAuthUserId(req));
      res.status(200).json({ data });
    } catch (error) {
      next(error);
    }
  };

  createInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = createInterviewSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const id = getRouteParam(req, "id");
      const data = await this.service.createInterview(id, getAuthUserId(req), parsed.data);
      res.status(201).json({ data, message: "Interview scheduled" });
    } catch (error) {
      next(error);
    }
  };

  updateInterview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = updateInterviewSchema.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error.message);

      const id = getRouteParam(req, "id");
      const interviewId = getRouteParam(req, "interviewId");
      const data = await this.service.updateInterview(
        id,
        interviewId,
        getAuthUserId(req),
        parsed.data,
      );
      res.status(200).json({ data, message: "Interview updated" });
    } catch (error) {
      next(error);
    }
  };
}
