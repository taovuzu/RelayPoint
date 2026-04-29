import envConfig from '#config/env.config.js';

export const SALT_ROUNDS = envConfig.BCRYPT_SALT_ROUNDS;

export const RUN_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESS: 'PROCESS',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
});

export const OUTBOX_STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
});

export const SERVICES = Object.freeze({
  GMAIL: 'GMAIL',
  SLACK: 'SLACK',
  GITHUB: 'GITHUB',
  NOTION: 'NOTION',
});

export const NANGO_INTEGRATION_IDS = Object.freeze({
  GMAIL: envConfig.GMAIL_INTEGRATION_ID,
  SLACK: envConfig.SLACK_INTEGRATION_ID,
  GITHUB: envConfig.GITHUB_INTEGRATION_ID,
  NOTION: envConfig.NOTION_INTEGRATION_ID,
});

export const NANGO_TO_SERVICE_MAPPING = Object.freeze({
  [envConfig.GMAIL_INTEGRATION_ID]: 'GMAIL',
  [envConfig.SLACK_INTEGRATION_ID]: 'SLACK',
  [envConfig.GITHUB_INTEGRATION_ID]: 'GITHUB',
  [envConfig.NOTION_INTEGRATION_ID]: 'NOTION',
  'GMAIL': 'GMAIL',
  'SLACK': 'SLACK',
  'GITHUB': 'GITHUB',
  'NOTION': 'NOTION'
});

export const ACTION_TYPES = Object.freeze({
  SEND_EMAIL: 'sendEmail',
  SEND_MESSAGE_TO_CHANNEL: 'sendMessageToChannel',
  SEND_DIRECT_MESSAGE: 'sendDirectMessage',
  CREATE_ISSUE: 'createIssue',
  CREATE_PAGE: 'createPage',
});

export const TRIGGER_TYPES = Object.freeze({
  WEBHOOK: 'catchRawWebhook',
  NEW_ISSUE_EVENT: 'newIssueEvent',
  NEW_PUSH_EVENT: 'newPushEvent',
  NEW_MESSAGE: 'newMessage',
  NEW_EMAIL: 'newEmail',
});
