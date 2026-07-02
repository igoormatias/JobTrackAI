import { Router } from "express";

import { requireAuth } from "../../../middlewares/auth-middleware.js";
import { CompanyController } from "../controllers/company.controller.js";

export const createCompanyRoutes = (): Router => {
  const router = Router();
  const controller = new CompanyController();

  router.use(requireAuth);
  router.get("/", controller.listCompanies);

  return router;
};
