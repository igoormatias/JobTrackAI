import { z } from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().default(3333),
    DATABASE_URL: z.string().optional(),
    REDIS_URL: z.string().optional(),
    JWT_SECRET: z.string().optional(),
    JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
    JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),
    FRONTEND_URL: z.string().default("http://localhost:3000"),
    GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required for Google OAuth"),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    ENABLE_V2_FEATURES: z
      .enum(["true", "false"])
      .default("false")
      .transform((v) => v === "true"),
  })
  .superRefine((data, ctx) => {
    if (data.NODE_ENV === "production") {
      if (!data.DATABASE_URL) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "DATABASE_URL is required in production",
          path: ["DATABASE_URL"],
        });
      }
      if (!data.JWT_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "JWT_SECRET is required in production",
          path: ["JWT_SECRET"],
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export const loadEnv = (): Env => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error(`Invalid environment variables: ${parsed.error.message}`);
  }

  return parsed.data;
};

export const env = loadEnv();
