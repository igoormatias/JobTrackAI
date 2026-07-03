import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";

import { getCorsOrigins } from "./config/env.js";
import {
  errorMiddleware,
  globalRateLimiter,
  notFoundMiddleware,
  requestLoggerMiddleware,
} from "./middlewares/index.js";
import { createRoutes } from "./routes/index.js";

const apiMountPath = process.env.VERCEL ? "/api/backend" : "/";

export const createApp = () => {
  const app = express();

  // Vercel sits behind a reverse proxy (X-Forwarded-For). Required for rate-limit and cookies.
  if (process.env.VERCEL) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: getCorsOrigins(),
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(requestLoggerMiddleware);
  app.use(globalRateLimiter);

  app.use(apiMountPath, createRoutes());

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};

const app = createApp();

export default app;
