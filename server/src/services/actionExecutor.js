import { RelayRun } from '../models/relayRun.model.js';
import { parse } from '../utils/parser.js';
import { sendEmailAction } from './actions/email.service.js';
import { sendSolAction } from './actions/solana.service.js';
import logger from '../utils/logger.js';

const actionHandlers = {
  SEND_EMAIL_SMTP: sendEmailAction,
  SEND_SOL: sendSolAction,
};


export async function executeRelayStage(relayRunId, stage) {
  const relayRun = await RelayRun.findById(relayRunId).populate({
    path: 'relayId',
    model: 'Relay',
  });

  if (!relayRun) throw new Error(`RelayRun not found: ${relayRunId}`);

  const actions = relayRun.relayId.actions.sort((a, b) => a.order - b.order);
  const currentAction = actions.find(a => a.order === stage);
  if (!currentAction) throw new Error(`Action at stage ${stage} not found for RelayRun ${relayRunId}`);

  const startTime = Date.now();
  const historyEntry = {
    actionOrder: currentAction.order,
    actionName: currentAction.name,
    status: 'pending',
    executedAt: new Date(),
  };

  try {
    const parsedConfig = {};
    for (const key in currentAction.config) {
      parsedConfig[key] = parse(currentAction.config[key], relayRun.triggerMetadata);
    }

    const handler = actionHandlers[currentAction.actionId];
    if (!handler) {
      throw new Error(`No handler found for action type: ${currentAction.actionId}`);
    }
    const result = await handler(parsedConfig);

    historyEntry.status = 'success';
    historyEntry.output = JSON.stringify(result);

  } catch (error) {
    logger.error(`Error executing action at stage ${stage} for RelayRun ${relayRunId}`, error);
    historyEntry.status = 'failed';
    historyEntry.error = error.message;
  }

  historyEntry.duration = Date.now() - startTime;

  const isLastStage = stage >= actions.length - 1;
  const nextStage = isLastStage ? null : stage + 1;
  const finalStatus = isLastStage ? (historyEntry.status === 'success' ? 'success' : 'failed') : 'running';

  await RelayRun.updateOne(
    { _id: relayRunId },
    { $push: { executionHistory: historyEntry } }
  );

  return { nextStage, finalStatus, historyEntry };
}