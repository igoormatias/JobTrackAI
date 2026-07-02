import cookieParser from "cookie-parser";
import express from "express";

import { errorMiddleware } from "../middlewares/index.js";

export const createIntegrationTestApp = (registerRoutes: (app: express.Express) => void) => {
  const app = express();
  app.use(cookieParser());
  app.use(express.json());
  registerRoutes(app);
  app.use(errorMiddleware);
  return app;
};
