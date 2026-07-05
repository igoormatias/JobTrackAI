import { Router } from "express";

import { verifyCronSecret } from "../../../../../middlewares/verify-cron-secret.middleware.js";
import { RunAllProvidersUseCase } from "../../../application/use-cases/run-providers.use-cases.js";
import { createJobAggregationService } from "./provider.routes.js";

export const createInternalRoutes = (): Router => {
  const router = Router();
  const runAllProviders = new RunAllProvidersUseCase(createJobAggregationService());

  router.get("/cron/provider-sync", verifyCronSecret, async (_req, res, next) => {
    try {
      const data = await runAllProviders.execute();
      res.status(202).json({ data });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
