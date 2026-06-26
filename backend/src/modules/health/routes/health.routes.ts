import { Router } from "express";

import { HealthController } from "../controllers/health.controller.js";

export const createHealthRoutes = (): Router => {
  const router = Router();
  const controller = new HealthController();

  router.get("/", controller.getHealth);

  return router;
};
