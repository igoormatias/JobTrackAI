import type { NextFunction, Request, Response } from "express";

import { getAuthUserId } from "../../../shared/http/get-auth-user-id.js";
import { getRouteParam } from "../../../shared/http/get-route-param.js";
import { ValidationError } from "../../../shared/errors/validation-error.js";
import type { JobListResponseDto, JobResponseDto } from "../dto/job.dto.js";
import { favoriteJobSchema, jobListQuerySchema } from "../schemas/job.schema.js";
import { jobService, type JobService } from "../services/job.service.js";
import { normalizeJobListParams } from "../utils/normalize-job-list-params.js";

export class JobController {
  constructor(private readonly service: JobService = jobService) {}

  listJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = jobListQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const result = await this.service.listJobs(getAuthUserId(req), normalizeJobListParams(parsed.data));
      const response: JobListResponseDto = result;
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getJobById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await this.service.getJobById(getAuthUserId(req), getRouteParam(req, "id"));
      const response: JobResponseDto = { data: job };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  favoriteJob = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = favoriteJobSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const job = await this.service.favoriteJob(
        getAuthUserId(req),
        getRouteParam(req, "id"),
        parsed.data.isFavorite ?? true,
      );
      const response: JobResponseDto = { data: job, message: "Favorite updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  markViewed = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const job = await this.service.markViewed(getAuthUserId(req), getRouteParam(req, "id"));
      const response: JobResponseDto = { data: job, message: "Job marked as viewed" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
};
