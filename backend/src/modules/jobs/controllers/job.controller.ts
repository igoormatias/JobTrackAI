import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../../../shared/errors/validation-error.js";
import type { JobListResponseDto, JobResponseDto } from "../dto/job.dto.js";
import { favoriteJobSchema, jobListQuerySchema } from "../schemas/job.schema.js";
import { jobService, type JobService } from "../services/job.service.js";

export class JobController {
  constructor(private readonly service: JobService = jobService) {}

  listJobs = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = jobListQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const result = this.service.listJobs(parsed.data);
      const response: JobListResponseDto = result;
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getJobById = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const job = this.service.getJobById(req.params.id!);
      const response: JobResponseDto = { data: job };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  favoriteJob = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsed = favoriteJobSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const job = this.service.favoriteJob(req.params.id!, parsed.data.isFavorite ?? true);
      const response: JobResponseDto = { data: job, message: "Favorite updated" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  markViewed = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const job = this.service.markViewed(req.params.id!);
      const response: JobResponseDto = { data: job, message: "Job marked as viewed" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  applyToJob = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const job = this.service.applyToJob(req.params.id!);
      const response: JobResponseDto = { data: job, message: "Application created" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  removeApplication = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const job = this.service.removeApplication(req.params.id!);
      const response: JobResponseDto = { data: job, message: "Application removed" };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
