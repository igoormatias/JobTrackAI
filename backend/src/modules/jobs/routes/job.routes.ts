import { Router } from "express";

import { requireAuth } from "../../../middlewares/auth-middleware.js";
import { JobController } from "../controllers/job.controller.js";

export const createJobRoutes = (): Router => {
  const router = Router();
  const controller = new JobController();

  router.use(requireAuth);
  router.get("/", controller.listJobs);
  router.get("/:id", controller.getJobById);
  router.patch("/:id/favorite", controller.favoriteJob);
  router.post("/:id/view", controller.markViewed);
  router.post("/:id/apply", controller.applyToJob);
  router.delete("/:id/apply", controller.removeApplication);

  return router;
};
