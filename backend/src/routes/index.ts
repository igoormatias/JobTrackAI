import { Router } from "express";

import { createAuthRoutes } from "../modules/auth/routes/auth.routes.js";
import { createCompanyRoutes } from "../modules/companies/routes/company.routes.js";
import { createDashboardRoutes } from "../modules/dashboard/infrastructure/http/routes/dashboard.routes.js";
import { createJobRoutes } from "../modules/jobs/routes/job.routes.js";
import { createNotificationRoutes } from "../modules/notifications/infrastructure/http/routes/notification.routes.js";
import { createPipelineRoutes } from "../modules/pipeline/routes/pipeline.routes.js";
import { createTrackingRoutes } from "../modules/tracking/infrastructure/http/routes/tracking.routes.js";
import { createProfileRoutes } from "../modules/profiles/infrastructure/http/routes/profile.routes.js";
import { createRecommendationRoutes } from "../modules/recommendations/routes/recommendation.routes.js";
import { createSettingsRoutes } from "../modules/settings/infrastructure/http/routes/settings.routes.js";
import { createSystemRoutes } from "../modules/system/infrastructure/http/routes/system.routes.js";
import { createProviderRoutes } from "../modules/job-aggregation/infrastructure/http/routes/provider.routes.js";
import { createAiRoutes } from "../modules/ai/infrastructure/http/routes/ai.routes.js";
import { createJobImportRoutes } from "../modules/job-import/infrastructure/http/routes/job-import.routes.js";

export const createRoutes = (): Router => {
  const router = Router();

  router.use("/", createSystemRoutes());
  router.use("/auth", createAuthRoutes());
  router.use("/profile", createProfileRoutes());
  router.use("/settings", createSettingsRoutes());
  router.use("/jobs/import", createJobImportRoutes());
  router.use("/jobs", createJobRoutes());
  router.use("/companies", createCompanyRoutes());
  router.use("/tracking", createTrackingRoutes());
  router.use("/pipeline", createPipelineRoutes());
  router.use("/dashboard", createDashboardRoutes());
  router.use("/notifications", createNotificationRoutes());
  router.use("/recommendations", createRecommendationRoutes());
  router.use("/providers", createProviderRoutes());
  router.use("/ai", createAiRoutes());

  return router;
};
