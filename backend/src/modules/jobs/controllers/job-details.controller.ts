import type { NextFunction, Request, Response } from "express";

import { getAuthUserId } from "../../../shared/http/get-auth-user-id.js";
import { getRouteParam } from "../../../shared/http/get-route-param.js";
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

  getJobMatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getJobMatch(getAuthUserId(req), getRouteParam(req, "id"));
      const response: JobMatchResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getRelatedJobs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getRelatedJobs(getAuthUserId(req), getRouteParam(req, "id"));
      const response: JobRelatedResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getJobTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getJobTimeline(getAuthUserId(req), getRouteParam(req, "id"));
      const response: JobTimelineResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getJobInsights = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getJobInsights(getAuthUserId(req), getRouteParam(req, "id"));
      const response: JobInsightsResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getLearningGaps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.getLearningGaps(getAuthUserId(req), getRouteParam(req, "id"));
      const response: LearningGapsResponseDto = { data };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
}
