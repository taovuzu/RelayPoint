const TERMINAL_STATUSES = new Set(['SUCCESS', 'FAILURE']);

export function isTerminalStatus(status) {
  return TERMINAL_STATUSES.has(status);
}

export function getStageLabel(actionId, apps = []) {
  if (!actionId) return 'Unknown Step';
  for (const app of apps) {
    const action = app.actions?.find(a => a.key === actionId);
    if (action) return action.name;
    const trigger = app.triggers?.find(t => t.key === actionId);
    if (trigger) return trigger.name;
  }
  return actionId;
}

export function getStageIcon(actionId, apps = []) {
  if (!actionId) return null;
  for (const app of apps) {
    if (app.actions?.some(a => a.key === actionId) || app.triggers?.some(t => t.key === actionId)) {
      return app.iconUrl;
    }
  }
  return null;
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
