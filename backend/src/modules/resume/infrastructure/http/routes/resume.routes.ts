import { Router } from "express";

import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { ResumeController, resumeUploadMiddleware } from "../controllers/resume.controller.js";

export const createResumeRoutes = (): Router => {
  const router = Router();
  const controller = new ResumeController();

  router.use(requireAuth);
  router.get("/", controller.get);
  router.put("/", controller.update);
  router.post("/upload", resumeUploadMiddleware, controller.upload);
  router.post("/import/text", controller.importTextHandler);
  router.get("/versions", controller.listVersionsHandler);
  router.post("/versions/:id/restore", controller.restoreVersionHandler);
  router.post("/analyze-job", controller.analyzeJobHandler);
  router.get("/history", controller.history);
  router.get("/analyses/:id", controller.getAnalysisHandler);
  router.post("/suggestions/:id/apply", controller.applySuggestionHandler);
  router.post("/suggestions/:id/reject", controller.rejectSuggestionHandler);

  return router;
};
