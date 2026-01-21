import envConfig from '#config/env.config.js';
import pgConfig  from '#config/pg.config.js';

import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;
