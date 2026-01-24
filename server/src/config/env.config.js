import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  // App
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('8080').transform(Number),
  HOST: z.string().default('localhost'),
  APP_NAME: z.string().min(1, "APP_NAME is required"),
  APP_URL: z.string().url("APP_URL must be a valid URL"),

  // Redis
  REDIS_USERNAME: z.string().optional().default('default'),
  REDIS_HOST: z.string().min(1, "REDIS_HOST is required"),
  REDIS_PORT: z.string().default('6379').transform(Number),
  REDIS_PASSWORD: z.string().optional().default(''),
  REDIS_URL: z.string().url("REDIS_URL must be a valid URL"),

  // Auth
  COOKIE_SECRET: z.string().min(32, "COOKIE_SECRET should be at least 32 characters"),
  REGISTRATION_TOKEN_SECRET: z.string().min(32, "REGISTRATION_TOKEN_SECRET should be at least 32 characters"),
  REGISTRATION_TOKEN_EXPIRY: z.string().default('900000').transform(Number),

  ACCESS_TOKEN_SECRET: z.string().min(32, "ACCESS_TOKEN_SECRET should be at least 32 characters"),
  ACCESS_TOKEN_EXPIRY: z.string().min(1),

  REFRESH_TOKEN_SECRET: z.string().min(32, "REFRESH_TOKEN_SECRET should be at least 32 characters"),
  REFRESH_TOKEN_EXPIRY: z.string().min(1),

  USER_TEMPORARY_TOKEN_EXPIRY: z.string().default('3600000').transform(Number),
  USER_PASSWORD_EXPIRY: z.string().default('86400000').transform(Number),
  ENCRYPTION_KEY: z.string().length(64, 'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes)'),

  // Mail
  MAIL_LINK: z.string().url(),
  MAIL_SENDER: z.string().email(),
  MAILTRAP_SMTP_HOST: z.string().min(1),
  MAILTRAP_SMTP_PORT: z.string().default('587').transform(Number),
  MAILTRAP_SMTP_USER: z.string().min(1),
  MAILTRAP_SMTP_PASS: z.string().min(1),
  MAILTRAP_SMTP_SECURE: z.string().transform((v) => v === 'true').default('false'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),

  // Frontend & SSO
  CLIENT_SSO_REDIRECT_URL: z.string().url(),
  FRONTEND_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.string().url(),

  // AWS
  AWS_REGION: z.string().min(1),
  S3_BUCKET_NAME: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),

  // Rate Limiting & Slowdown
  GLOBAL_SLOWDOWN_WINDOW_MS: z.string().default('900000').transform(Number),
  GLOBAL_SLOWDOWN_THRESHOLD: z.string().default('100').transform(Number),
  GLOBAL_SLOWDOWN_DELAY_STEP_MS: z.string().default('500').transform(Number),
  GLOBAL_SLOWDOWN_PREFIX: z.string().default('gs'),

  DOWNLOAD_RATE_LIMIT_WINDOW_MS: z.string().default('86400000').transform(Number),
  DOWNLOAD_RATE_LIMIT_MAX_REQUESTS: z.string().default('8').transform(Number),
  DOWNLOAD_RATE_LIMIT_PREFIX: z.string().default('dl-rl'),

  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100').transform(Number),

  SENSITIVE_RATE_LIMIT_WINDOW_MS: z.string().default('600000').transform(Number),
  SENSITIVE_RATE_LIMIT_MAX_REQUESTS: z.string().default('10').transform(Number),
  SENSITIVE_RATE_LIMIT_PREFIX: z.string().default('sen-rl'),

  // Kafka
  KAFKA_BROKERS: z.string().default('localhost:9094').transform((v) => v.split(',')),

  // Nango
  NANGO_SECRET_KEY: z.string().min(1, "NANGO_SECRET_KEY is required"),
});

export function validateEnv() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("Invalid Environment Variables:");
    console.error(JSON.stringify(result.error.flatten().fieldErrors, null, 2));
    process.exit(1);
  }

  return result.data;
}

const envConfig = validateEnv();

export default envConfig;

// ref: https://zod.dev/
