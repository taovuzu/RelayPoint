import { Nango } from '@nangohq/node';
import envConfig from '#config/env.config.js';

export const nango = new Nango({
  secretKey: envConfig.NANGO_SECRET_KEY,
});

export default nango;

// ref: https://nango.dev/docs/implementation-guides/platform/auth/implement-api-auth
