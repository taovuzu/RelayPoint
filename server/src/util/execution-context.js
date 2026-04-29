export function buildExecutionContext(triggerData, executionHistory = []) {
  if (!triggerData) {
    throw new Error('Execution context build failed: triggerData is missing.');
  }

  const context = {
    trigger: triggerData,
    steps: {},
  };

  for (const entry of executionHistory) {
    if (entry.status === 'SUCCESS' && entry.dataOut != null) {
      context.steps[String(entry.stageIndex)] = entry.dataOut;
    }
  }

  return { ...triggerData, ...context };
}
