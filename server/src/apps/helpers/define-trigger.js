export default function defineTrigger(triggerDefinition) {
  if (triggerDefinition.type !== 'webhook' && triggerDefinition.type !== 'nango_sync') {
    throw new Error(`Trigger ${triggerDefinition.key} must be type 'webhook' or 'nango_sync'. Polling is not supported.`);
  }
  return triggerDefinition;
}
