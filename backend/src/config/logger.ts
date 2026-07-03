import pino from "pino";

import { env } from "./env.js";

export const shouldUsePrettyTransport = (): boolean => {
  if (process.env.VERCEL) return false;
  if (process.env.LOG_PRETTY === "true") return true;
  if (process.env.LOG_PRETTY === "false") return false;
  return env.NODE_ENV !== "production";
};

const usePretty = shouldUsePrettyTransport();

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (env.NODE_ENV === "production" ? "info" : "debug"),
  ...(usePretty
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      }
    : {}),
});
