import type { NextFunction, Request, Response } from "express";

import type {
  JobInsightsResponseDto,
  JobMatchResponseDto,
  JobRelatedResponseDto,
  JobTimelineResponseDto,
  LearningGapsResponseDto,
} from "../dto/job-details.dto.js";
import { jobDetailsService, type JobDetailsService } from "../services/job-details.service.js";

export class JobDetailsController {
  constructor(private readonly service: JobDetailsService = jobDetailsService) {}

  getJobMatch = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.getJobMatch(req.params.id!);
      const response: JobMatchResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getRelatedJobs = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.getRelatedJobs(req.params.id!);
      const response: JobRelatedResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getJobTimeline = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.getJobTimeline(req.params.id!);
      const response: JobTimelineResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getJobInsights = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.getJobInsights(req.params.id!);
      const response: JobInsightsResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getLearningGaps = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const data = this.service.getLearningGaps(req.params.id!);
      const response: LearningGapsResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
