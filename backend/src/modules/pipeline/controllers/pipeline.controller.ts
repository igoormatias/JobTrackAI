import type { NextFunction, Request, Response } from "express";

import { getAuthUserId } from "../../../shared/http/get-auth-user-id.js";
import { getRouteParam } from "../../../shared/http/get-route-param.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";
import type { PipelineStage } from "../../../shared/domain/pipeline-stage.js";
import type {
  ApplicationResponseDto,
  DeleteResponseDto,
  PipelineResponseDto,
  TimelineResponseDto,
} from "../dto/pipeline.dto.js";
import { moveApplicationSchema, pipelineListQuerySchema } from "../schemas/pipeline.schema.js";
import { pipelineService, type PipelineService } from "../services/pipeline.service.js";

export class PipelineController {
  constructor(private readonly service: PipelineService = pipelineService) {}

  getPipeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = pipelineListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const data = await this.service.getPipeline(getAuthUserId(req), parsed.data);
      const response: PipelineResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  moveApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = moveApplicationSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const body = parsed.data as { stage: PipelineStage; occurredAt?: string };
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.moveApplication(
        userId,
        id,
        body.stage,
        body.occurredAt ?? new Date().toISOString(),
      );
      const response: ApplicationResponseDto = { data, message: "Status updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  favoriteApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.favoriteApplication(userId, id);
      const response: ApplicationResponseDto = { data, message: "Favorite updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  archiveApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.archiveApplication(userId, id);
      const response: ApplicationResponseDto = { data, message: "Application archived" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      await this.service.deleteApplication(userId, id);
      const response: DeleteResponseDto = { message: "Application deleted" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = getAuthUserId(req);
      const id = getRouteParam(req, "id");
      const data = await this.service.getTimeline(userId, id);
      const response: TimelineResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
