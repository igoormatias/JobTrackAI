import { Router } from "express";

import { createAuthRoutes } from "../modules/auth/routes/auth.routes.js";
import { createHealthRoutes } from "../modules/health/routes/health.routes.js";
import { createJobRoutes } from "../modules/jobs/routes/job.routes.js";
import { createProfileRoutes } from "../modules/profiles/routes/profile.routes.js";
import { createRecommendationRoutes } from "../modules/recommendations/routes/recommendation.routes.js";

export const createRoutes = (): Router => {
  const router = Router();

  router.use("/health", createHealthRoutes());
  router.use("/auth", createAuthRoutes());
  router.use("/profile", createProfileRoutes());
  router.use("/jobs", createJobRoutes());
  router.use("/recommendations", createRecommendationRoutes());

  return router;
};
