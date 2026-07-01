import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../../../shared/errors/validation-error.js";
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

  getPipeline = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = pipelineListQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const data = this.service.getPipeline(parsed.data);
      const response: PipelineResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  moveApplication = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = moveApplicationSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const data = this.service.moveApplication(req.params.id!, parsed.data.stage);
      const response: ApplicationResponseDto = { data, message: "Status updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  favoriteApplication = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.favoriteApplication(req.params.id!);
      const response: ApplicationResponseDto = { data, message: "Favorite updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  archiveApplication = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.archiveApplication(req.params.id!);
      const response: ApplicationResponseDto = { data, message: "Application archived" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  deleteApplication = (req: Request, res: Response, next: NextFunction): void => {
    try {
      this.service.deleteApplication(req.params.id!);
      const response: DeleteResponseDto = { message: "Application deleted" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getTimeline = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.getTimeline(req.params.id!);
      const response: TimelineResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
