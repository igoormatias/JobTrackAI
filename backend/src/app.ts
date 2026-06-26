import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { env } from "./config/env.js";
import { errorMiddleware, globalRateLimiter, notFoundMiddleware } from "./middlewares/index.js";
import { createRoutes } from "./routes/index.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(globalRateLimiter);

  app.use(createRoutes());

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
