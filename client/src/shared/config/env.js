import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('VITE_API_BASE_URL must be a valid URL'),
  VITE_NANGO_PUBLIC_KEY: z.string().min(1, 'VITE_NANGO_PUBLIC_KEY is required'),
  VITE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_API_TIMEOUT: z.string().default('15000').transform(Number),
});

export function validateEnv() {
  const result = envSchema.safeParse(import.meta.env);

  if (!result.success) {
    const errorMessages = result.error.flatten().fieldErrors;
    console.error('[env.js] Invalid Environment Variables:', errorMessages);

    throw new Error(
      `Environment validation failed: ${Object.keys(errorMessages).join(', ')}`
    );
  }

  return result.data;
}

const envConfig = validateEnv();

export default envConfig;

// ref: https://zod.dev/
