import omit from 'lodash/omit.js';

const chooseConnectionStep = {
  key: 'chooseConnection',
  name: 'Choose connection',
};

const testStep = (stepType) => ({
  key: 'testStep',
  name: stepType === 'trigger' ? 'Test trigger' : 'Test action',
});

export const addStaticSubsteps = (stepType, appData, step) => {
  const computedStep = { ...omit(step, ['run', 'testRun', 'registerHook', 'unregisterHook']) };

  computedStep.substeps = [];

  if (appData.supportsConnections && step.supportsConnections !== false) {
    computedStep.substeps.push(chooseConnectionStep);
  }

  if (step.arguments) {
    computedStep.substeps.push({
      key: 'chooseTrigger',
      name: stepType === 'trigger' ? 'Set up a trigger' : 'Set up action',
      arguments: step.arguments,
    });
  }
  
  computedStep.substeps.push(testStep(stepType));

  return computedStep;
};

export const formatAppForClient = (app, stripFuncs = true) => {
  const formattedApp = {
    ...omit(app, ['triggers', 'actions', 'dynamicData', 'dynamicFields', 'beforeRequest']),
    triggers: app.triggers?.map(t => addStaticSubsteps('trigger', app, t)) || [],
    actions: app.actions?.map(a => addStaticSubsteps('action', app, a)) || [],
  };

  return formattedApp;
};
