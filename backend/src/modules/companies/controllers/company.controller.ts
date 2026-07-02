import type { NextFunction, Request, Response } from "express";

import { ValidationError } from "../../../shared/errors/validation-error.js";
import { companyListQuerySchema } from "../schemas/company.schema.js";
import { companyService, type CompanyService } from "../services/company.service.js";

export class CompanyController {
  constructor(private readonly service: CompanyService = companyService) {}

  listCompanies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = companyListQuerySchema.safeParse(req.query);

      if (!parsed.success) {
        throw new ValidationError(parsed.error.message);
      }

      const result = await this.service.listCompanies(parsed.data);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
