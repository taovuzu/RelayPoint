import { getAllApps, getApp as getAppFromLoader, findActionByKey, findTriggerByKey } from '#apps/app-loader.js';
import { createGlobalVariable } from '#apps/global-variable.js';
import { formatAppForClient } from '#apps/helpers/app-utils.js';

export const listApps = (req, res) => {
  const apps = getAllApps().map((a) => formatAppForClient(a));
  res.json({ success: true, data: apps });
};

export const getApp = (req, res) => {
  const { appKey } = req.params;
  const app = getAppFromLoader(appKey);
  if (!app) {
    return res.status(404).json({ success: false, message: `App ${appKey} not found` });
  }
  
  const formattedApp = formatAppForClient(app);
  res.json({ success: true, data: formattedApp });
};

export const getDynamicData = async (req, res, next) => {
  try {
    const { appKey } = req.params;
    const { dynamicDataKey, parameters } = req.body;
    const app = getAppFromLoader(appKey);
    if (!app) throw new Error(`App ${appKey} not found`);

    const command = app.dynamicData?.find((d) => d.key === dynamicDataKey);
    if (!command) throw new Error(`Dynamic data ${dynamicDataKey} not found in app ${appKey}`);

    const $ = await createGlobalVariable({
      app,
      userId: req.user.id,
      stepParameters: parameters,
    });
    const result = await command.run($);
    res.json({ success: true, data: result.data });
  } catch (err) {
    next(err);
  }
};

export const testTrigger = async (req, res, next) => {
  try {
    const { triggerKey, parameters } = req.body;
    const found = findTriggerByKey(triggerKey);
    if (!found) throw new Error(`Trigger ${triggerKey} not found`);

    const { app, trigger } = found;

    const $ = await createGlobalVariable({
      app,
      userId: req.user.id,
      stepParameters: parameters,
    });

    if (trigger.testRun) {
      await trigger.testRun($);
    } else {
      await trigger.run($);
    }

    res.json({ success: true, data: $.triggerOutput.data[0] || {} });
  } catch (err) {
    next(err);
  }
};

export const testAction = async (req, res, next) => {
  try {
    const { actionKey, parameters } = req.body;
    const found = findActionByKey(actionKey);
    if (!found) throw new Error(`Action ${actionKey} not found`);

    const { app, action } = found;

    const $ = await createGlobalVariable({
      app,
      userId: req.user.id,
      stepParameters: parameters,
    });

    await action.run($);
    res.json({ success: true, data: $.actionOutput.data?.raw ?? {} });
  } catch (err) {
    next(err);
  }
};

