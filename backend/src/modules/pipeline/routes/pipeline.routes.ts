import { Router } from "express";

import { requireAuth } from "../../../middlewares/auth-middleware.js";
import { PipelineController } from "../controllers/pipeline.controller.js";

export const createPipelineRoutes = (): Router => {
  const router = Router();
  const controller = new PipelineController();

  router.use(requireAuth);
  router.get("/", controller.getPipeline);
  router.patch("/:id/status", controller.moveApplication);
  router.patch("/:id/favorite", controller.favoriteApplication);
  router.patch("/:id/archive", controller.archiveApplication);
  router.delete("/:id", controller.deleteApplication);
  router.get("/:id/timeline", controller.getTimeline);

  return router;
};
