import { Router } from "express";

import { requireAuth } from "../../../middlewares/auth-middleware.js";
import { RecommendationController } from "../controllers/recommendation.controller.js";

export const createRecommendationRoutes = (): Router => {
  const router = Router();
  const controller = new RecommendationController();

  router.use(requireAuth);
  router.get("/", controller.list);

  return router;
};
