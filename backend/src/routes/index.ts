import { Router } from "express";

import { createAuthRoutes } from "../modules/auth/routes/auth.routes.js";
import { createJobRoutes } from "../modules/jobs/routes/job.routes.js";
import { createPipelineRoutes } from "../modules/pipeline/routes/pipeline.routes.js";
import { createProfileRoutes } from "../modules/profiles/routes/profile.routes.js";
import { createRecommendationRoutes } from "../modules/recommendations/routes/recommendation.routes.js";
import { createSystemRoutes } from "../modules/system/infrastructure/http/routes/system.routes.js";

export const createRoutes = (): Router => {
  const router = Router();

  router.use("/", createSystemRoutes());
  router.use("/auth", createAuthRoutes());
  router.use("/profile", createProfileRoutes());
  router.use("/jobs", createJobRoutes());
  router.use("/pipeline", createPipelineRoutes());
  router.use("/recommendations", createRecommendationRoutes());

  return router;
};
