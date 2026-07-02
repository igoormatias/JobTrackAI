import { Router } from "express";

import { authLoginRateLimiter } from "../../../middlewares/rate-limit.js";
import { AuthController } from "../controllers/auth.controller.js";

export const createAuthRoutes = (): Router => {
  const router = Router();
  const controller = new AuthController();

  router.post("/login", authLoginRateLimiter, controller.login);
  router.post("/logout", controller.logout);
  router.post("/refresh", controller.refresh);
  router.get("/me", controller.me);
  router.post("/onboarding/complete", controller.completeOnboarding);

  return router;
};
