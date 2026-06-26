import { Router } from "express";

import { createAuthRoutes } from "../modules/auth/routes/auth.routes.js";
import { createHealthRoutes } from "../modules/health/routes/health.routes.js";
import { createProfileRoutes } from "../modules/profiles/routes/profile.routes.js";

export const createRoutes = (): Router => {
  const router = Router();

  router.use("/health", createHealthRoutes());
  router.use("/auth", createAuthRoutes());
  router.use("/profile", createProfileRoutes());

  return router;
};
