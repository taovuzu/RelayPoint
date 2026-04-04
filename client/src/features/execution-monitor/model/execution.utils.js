import { ACTION_REGISTRY, TRIGGER_REGISTRY } from '@/features/workflow-builder/model/node-registry';

const TERMINAL_STATUSES = new Set(['SUCCESS', 'FAILURE']);

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status);
}


export function getStageLabel(actionId) {
  if (!actionId) return 'Unknown Step';
  return ACTION_REGISTRY[actionId]?.label || TRIGGER_REGISTRY[actionId]?.label || actionId;
}


export function getStageIcon(actionId) {
  if (!actionId) return null;
  return ACTION_REGISTRY[actionId]?.icon || TRIGGER_REGISTRY[actionId]?.icon || null;
}


export function calculateSuccessRate(runs) {
  if (!runs?.length) return null;

  const terminalRuns = runs.filter(r => isTerminalStatus(r.status));
  if (terminalRuns.length === 0) return null;

  const successCount = terminalRuns.filter(r => r.status === 'SUCCESS').length;
  return Math.round((successCount / terminalRuns.length) * 100);
}


export function groupRunsByDate(runs) {
  if (!runs?.length) return {};

  return runs.reduce((acc, run) => {
    const dateKey = run.startedAt
      ? new Date(run.startedAt).toISOString().split('T')[0]
      : 'unknown';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(run);
    return acc;
  }, {});
}
