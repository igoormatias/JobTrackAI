import { Router } from "express";

import { createHealthRoutes } from "../modules/health/routes/health.routes.js";

export const createRoutes = (): Router => {
  const router = Router();

  router.use("/health", createHealthRoutes());

  return router;
};
