import { Router } from "express";

import { requireAuth } from "../../../middlewares/auth-middleware.js";
import { JobDetailsController } from "../controllers/job-details.controller.js";
import { JobController } from "../controllers/job.controller.js";

export const createJobRoutes = (): Router => {
  const router = Router();
  const controller = new JobController();
  const detailsController = new JobDetailsController();

  router.use(requireAuth);
  router.get("/", controller.listJobs);
  router.get("/:id/match", detailsController.getJobMatch);
  router.get("/:id/related", detailsController.getRelatedJobs);
  router.get("/:id/timeline", detailsController.getJobTimeline);
  router.get("/:id/insights", detailsController.getJobInsights);
  router.get("/:id/learning-gaps", detailsController.getLearningGaps);
  router.get("/:id", controller.getJobById);
  router.patch("/:id/favorite", controller.favoriteJob);
  router.post("/:id/view", controller.markViewed);
  router.post("/:id/apply", controller.applyToJob);
  router.delete("/:id/apply", controller.removeApplication);

  return router;
};
