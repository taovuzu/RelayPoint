import prisma from '#db/index.db.js';
import { RUN_STATUS } from '#constant.js'
import logger from '#util/logger.js';

export const isAlreadyProcessed = async (relayRunId, stageIndex) => {
  const run = await prisma.relayRun.findUnique({
    where: { id: relayRunId }
  });

  if (!run) {
    logger.warn('Idempotency: RelayRun not found', { relayRunId });
    return true; 
  }

  if (run.status === RUN_STATUS.SUCCESS || run.status === RUN_STATUS.FAILURE || run.currentStage > stageIndex) {
    return true;
  }
  
  return false;
};

export const markInProgress = async (relayRunId) => {
  try {
    const run = await prisma.relayRun.update({
      where: { id: relayRunId, status: RUN_STATUS.PENDING },
      data: { status: RUN_STATUS.PROCESS }
    });

    return !!run;
  } catch (error) {
    return false; 
  }
};

