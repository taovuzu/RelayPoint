export const USERLOGIN_TYPES = {
  GOOGLE: "GOOGLE",
  FACEBOOK: "FACEBOOK", 
  EMAIL_PASSWORD: "EMAIL_PASSWORD"
};
export const AVAILABLELOGIN_TYPES = Object.values(USERLOGIN_TYPES);

export const AVAILABLE_ACTIONS = {
  SEND_EMAIL_SMTP: {
    id: 'SEND_EMAIL_SMTP',
    name: 'Send an Email (SMTP)',
    description: 'Sends an email via your own SMTP server.',
    category: 'Communication'
  },
  SEND_SOL: {
    id: 'SEND_SOL',
    name: 'Send SOL',
    description: 'Sends SOL tokens to a specified wallet address.',
    category: 'Blockchain'
  },
  WEBHOOK_POST: {
    id: 'WEBHOOK_POST',
    name: 'Send Webhook',
    description: 'Makes a POST request to a specified URL.',
    category: 'Integration'
  },
  DELAY: {
    id: 'DELAY',
    name: 'Delay',
    description: 'Waits for a specified amount of time before continuing.',
    category: 'Control'
  },
  CONDITIONAL: {
    id: 'CONDITIONAL',
    name: 'Conditional Logic',
    description: 'Executes different actions based on conditions.',
    category: 'Control'
  }
};

export const AVAILABLE_TRIGGERS = {
  INCOMING_WEBHOOK: {
    id: 'INCOMING_WEBHOOK',
    name: 'Incoming Webhook',
    description: 'Starts the Relay when a POST request is received.',
    category: 'Integration'
  },
  SCHEDULE: {
    id: 'SCHEDULE',
    name: 'Schedule',
    description: 'Starts the Relay on a recurring schedule.',
    category: 'Time'
  },
  EMAIL_RECEIVED: {
    id: 'EMAIL_RECEIVED',
    name: 'Email Received',
    description: 'Starts the Relay when an email is received.',
    category: 'Communication'
  }
};

export const AVAILABLE_ACTION_TYPES = Object.keys(AVAILABLE_ACTIONS);
export const AVAILABLE_TRIGGER_TYPES = Object.keys(AVAILABLE_TRIGGERS);

export const RELAY_RUN_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  SUCCESS: "success",
  FAILED: "failed",
  CANCELLED: "cancelled"
};
export const AVAILABLE_RELAY_RUN_STATUS = Object.values(RELAY_RUN_STATUS);

export const EXECUTION_STATUS = {
  PENDING: "pending",
  SUCCESS: "success",
  FAILED: "failed",
  SKIPPED: "skipped"
};
export const AVAILABLE_EXECUTION_STATUS = Object.values(EXECUTION_STATUS);

export const OUTBOX_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing"
};
export const AVAILABLE_OUTBOX_STATUS = Object.values(OUTBOX_STATUS);