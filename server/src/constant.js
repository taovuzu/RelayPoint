export const SALT_ROUNDS = 12;

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

export const ACTION_TYPES = Object.freeze({
  SEND_EMAIL: 'send-email',
  POST_SLACK_MESSAGE: 'post-message',
  CREATE_GITHUB_ISSUE: 'create-issue',
  CREATE_NOTION_PAGE: 'create-page',
});

export const TRIGGER_TYPES = Object.freeze({
  WEBHOOK: 'webhook',
  GITHUB_NEW_ISSUE: 'github-new-issue',
  SLACK_NEW_MESSAGE: 'slack-new-message',
  GMAIL_NEW_EMAIL: 'gmail-new-email',
  STRIPE: 'stripe',
  SHOPIFY: 'shopify',
  DISCORD: 'discord',
  LINEAR: 'linear',
  JIRA: 'jira',
  TYPEFORM: 'typeform',
  MAILCHIMP: 'mailchimp',
  HUBSPOT: 'hubspot',
  CALENDLY: 'calendly',
  TWILIO: 'twilio',
  INTERCOM: 'intercom',
  ZENDESK: 'zendesk',
  TRELLO: 'trello',
  ASANA: 'asana',
  SALESFORCE: 'salesforce',
});
