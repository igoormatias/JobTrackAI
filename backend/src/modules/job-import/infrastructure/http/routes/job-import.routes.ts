import { Router } from "express";

import { requireAuth } from "../../../../../middlewares/auth-middleware.js";
import { ConfirmJobImportUseCase } from "../../../application/use-cases/confirm-job-import.use-case.js";
import { PreviewJobFromUrlUseCase } from "../../../application/use-cases/preview-job-from-url.use-case.js";
import { JobImportController } from "../controllers/job-import.controller.js";

export const createJobImportRoutes = (): Router => {
  const router = Router();
  const previewJobFromUrlUseCase = new PreviewJobFromUrlUseCase();
  const confirmJobImportUseCase = new ConfirmJobImportUseCase();
  const controller = new JobImportController(previewJobFromUrlUseCase, confirmJobImportUseCase);

  router.use(requireAuth);
  router.post("/preview", controller.preview);
  router.post("/confirm", controller.confirm);

  return router;
};
