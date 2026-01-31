import logger from '#util/logger.js';

export const calculateBackoff = (attempt, baseMs = 1000, maxMs = 30000) => {
  const jitter = Math.random() * baseMs;
  const delay = Math.min(maxMs, baseMs * Math.pow(2, attempt) + jitter);
  return Math.floor(delay);
};

export const withRetry = async (fn, { maxRetries = 3, label = 'operation' } = {}) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = calculateBackoff(attempt);
        logger.warn(`[${label}] Retry ${attempt + 1}/${maxRetries} in ${delay}ms`, {
          error: err.message,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  logger.error(`[${label}] All ${maxRetries} retries exhausted`, { error: lastError.message });
  throw lastError;
};

export const withAuthRetry = async (fn, healAuth, { maxRetries = 3, label = 'operation' } = {}) => {
  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const status = err.status || err.response?.status;

      if (status === 401 && healAuth) {
        logger.warn(`[${label}] 401 Unauthorized. Attempting to heal auth (Attempt ${attempt + 1}/${maxRetries})...`);
        try {
          await healAuth();
          logger.info(`[${label}] Auth healed. Retrying immediately.`);
          continue;
        } catch (healErr) {
          logger.error(`[${label}] Auth healing failed`, { error: healErr.message });
          throw healErr;
        }
      }

      if (attempt < maxRetries) {
        const delay = calculateBackoff(attempt);
        logger.warn(`[${label}] Retry ${attempt + 1}/${maxRetries} in ${delay}ms`, {
          error: err.message,
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  logger.error(`[${label}] All ${maxRetries} retries exhausted`, { error: lastError.message });
  throw lastError;
};

export default { calculateBackoff, withRetry, withAuthRetry };
