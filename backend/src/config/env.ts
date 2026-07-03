import { z } from "zod";

const formatZodErrors = (error: z.ZodError): string =>
  error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "env";
      return `${path}: ${issue.message}`;
    })
    .join("\n");

const normalizeProcessEnv = (): NodeJS.ProcessEnv => {
  const normalized = { ...process.env };

  if (!normalized.JWT_SECRET && normalized.AUTH_SECRET) {
    normalized.JWT_SECRET = normalized.AUTH_SECRET;
  }
  if (!normalized.JWT_SECRET && normalized.SESSION_SECRET) {
    normalized.JWT_SECRET = normalized.SESSION_SECRET;
  }

  return normalized;
};

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string().optional(),
    DIRECT_DATABASE_URL: z.string().optional(),
    REDIS_URL: z.string().optional(),
    JWT_SECRET: z.string().optional(),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    ENABLE_V2_FEATURES: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    ENABLE_SCHEDULER: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    SYNC_INTERVAL: z.coerce.number().default(3_600_000),
    ENABLE_PROVIDER_GUPY: z
      .enum(["true", "false"])
      .default("true")
      .transform((v) => v === "true"),
    ENABLE_PROVIDER_LINKEDIN: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    ENABLE_PROVIDER_PROGRAMATHOR: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    SEED_CATALOG: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
    GEMINI_API_KEY: z.string().optional(),
    GEMINI_MODEL: z.string().default("gemini-2.5-flash"),
    PROMPT_VERSION: z.string().default("career-v1"),
    GEMINI_TIMEOUT_MS: z.coerce.number().default(30_000),
    AI_CAREER_DAILY_LIMIT: z.coerce.number().default(5),
    AI_CAREER_DEBOUNCE_MS: z.coerce.number().default(15_000),
    LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (!data.DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "DATABASE_URL is required in production (Supabase connection string)",
          path: ["DATABASE_URL"],
        });
      }
      if (!data.JWT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "JWT_SECRET is required in production (or set AUTH_SECRET / SESSION_SECRET)",
          path: ["JWT_SECRET"],
        });
      }
      if (!data.GOOGLE_CLIENT_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GOOGLE_CLIENT_ID is required in production for Google OAuth",
          path: ["GOOGLE_CLIENT_ID"],
        });
      }
      if (!data.GOOGLE_CLIENT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "GOOGLE_CLIENT_SECRET is required in production for Google OAuth",
          path: ["GOOGLE_CLIENT_SECRET"],
        });
      }
      if (!data.FRONTEND_URL || data.FRONTEND_URL === "http://localhost:3000") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "FRONTEND_URL must match the Vercel frontend URL for CORS and cookies",
          path: ["FRONTEND_URL"],
        });
      }
    }

    if (data.NODE_ENV !== "production" && !data.GOOGLE_CLIENT_ID) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "GOOGLE_CLIENT_ID is required for Google OAuth",
        path: ["GOOGLE_CLIENT_ID"],
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (): Env => {
  const parsed = envSchema.safeParse(normalizeProcessEnv());

  if (!parsed.success) {
    throw new Error(`Invalid environment variables:\n${formatZodErrors(parsed.error)}`);
  }

  return parsed.data;
};

export const env = loadEnv();

export const getCorsOrigins = (): string[] =>
  env.FRONTEND_URL.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
