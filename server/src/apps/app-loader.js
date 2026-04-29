import githubApp from '#apps/github/index.js';
import slackApp from '#apps/slack/index.js';
import gmailApp from '#apps/gmail/index.js';
import notionApp from '#apps/notion/index.js';
import webhookApp from '#apps/webhook/index.js';
import envConfig from '#config/env.config.js';

const apps = [
  { ...githubApp, apiBaseUrl: envConfig.GITHUB_API_BASE_URL },
  { ...slackApp, apiBaseUrl: envConfig.SLACK_API_BASE_URL },
  { ...gmailApp, apiBaseUrl: envConfig.GMAIL_API_BASE_URL },
  { ...notionApp, apiBaseUrl: envConfig.NOTION_API_BASE_URL },
  webhookApp
];
const appMap = Object.fromEntries(apps.map((a) => [a.key, a]));

export const getApp = (key) => appMap[key];

export const getAllApps = () => apps;

export const getAppByService = (service) =>
  apps.find((a) => a.service === service);

export const findActionByKey = (actionKey) => {
  for (const app of apps) {
    const action = app.actions?.find((a) => a.key === actionKey);
    if (action) return { app, action };
  }
  return null;
};

export const findTriggerByKey = (triggerKey) => {
  for (const app of apps) {
    const trigger = app.triggers?.find((t) => t.key === triggerKey);
    if (trigger) return { app, trigger };
  }
  return null;
};
