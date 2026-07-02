import { Router } from "express";

import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { GetDashboardUseCase } from "../../../application/use-cases/get-dashboard.use-case.js";
import { prismaDashboardRepository } from "../../repositories/prisma-dashboard.repository.js";
import { DashboardController } from "../controllers/dashboard.controller.js";

export const createDashboardRoutes = (): Router => {
  const router = Router();
  const getDashboardUseCase = new GetDashboardUseCase(prismaDashboardRepository);
  const controller = new DashboardController(getDashboardUseCase);

  router.use(requireAuth);
  router.get("/", controller.getDashboard);

  return router;
};
