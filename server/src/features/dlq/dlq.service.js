import logger from '#util/logger.js';

export const storeFailed = async (failedMessage, errorInfo) => {
  logger.error('DLQ: Message processing failed permanently', { 
    message: failedMessage, 
    error: errorInfo.error,
    stack: errorInfo.stack,
    timestamp: new Date().toISOString() 
  });
  
  //in future write to "FailedEvents" table in DB
};

