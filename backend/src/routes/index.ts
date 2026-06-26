import { Router } from "express";

import { createAuthRoutes } from "../modules/auth/routes/auth.routes.js";
import { createHealthRoutes } from "../modules/health/routes/health.routes.js";

export const createRoutes = (): Router => {
  const router = Router();

  router.use("/health", createHealthRoutes());
  router.use("/auth", createAuthRoutes());

  return router;
};
