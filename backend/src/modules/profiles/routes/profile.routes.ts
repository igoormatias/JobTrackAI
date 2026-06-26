import { Router } from "express";

import { requireAuth } from "../../../middlewares/auth-middleware.js";
import { ProfileController } from "../controllers/profile.controller.js";

export const createProfileRoutes = (): Router => {
  const router = Router();
  const controller = new ProfileController();

  router.use(requireAuth);
  router.get("/", controller.getProfile);
  router.post("/", controller.createProfile);
  router.patch("/", controller.updateProfile);

  return router;
};
