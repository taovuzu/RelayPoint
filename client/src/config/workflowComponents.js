export const AVAILABLE_TRIGGERS = [
  {
    id: 'INCOMING_WEBHOOK',
    name: 'Incoming Webhook',
    description: 'Starts the Relay when a webhook is received',
    icon: 'LinkOutlined',
    requiresConnection: false,
    configFields: [
      {
        name: 'webhookUrl',
        label: 'Webhook URL',
        type: 'text',
        required: true,
        placeholder: 'Will be generated automatically',
        readOnly: true
      }
    ]
  },
  {
    id: 'EMAIL_RECEIVED',
    name: 'New Email (Gmail)',
    description: 'Triggers when a new email arrives in your Gmail inbox',
    icon: 'MailOutlined',
    requiresConnection: true,
    connectionService: 'google',
    configFields: [
      {
        name: 'labelIds',
        label: 'Monitor Labels',
        type: 'select',
        required: false,
        placeholder: 'INBOX (default)',
        options: [
          { value: 'INBOX', label: 'Inbox' },
          { value: 'UNREAD', label: 'Unread' },
          { value: 'IMPORTANT', label: 'Important' }
        ]
      }
    ]
  },
  {
    id: 'GOOGLE_SHEETS_NEW_ROW',
    name: 'New Row in Google Sheets',
    description: 'Triggers when a new row is added to a Google Sheet',
    icon: 'TableOutlined',
    requiresConnection: true,
    connectionService: 'google',
    configFields: [
      {
        name: 'spreadsheetId',
        label: 'Spreadsheet ID',
        type: 'text',
        required: true,
        placeholder: 'Enter the ID from the Google Sheet URL'
      },
      {
        name: 'sheetName',
        label: 'Sheet Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Sheet1'
      },
      {
        name: 'pollingInterval',
        label: 'Check Every (minutes)',
        type: 'number',
        required: true,
        placeholder: '5',
        defaultValue: 5
      }
    ]
  },
  {
    id: 'SCHEDULE',
    name: 'Schedule',
    description: 'Triggers at specified intervals',
    icon: 'ClockCircleOutlined',
    requiresConnection: false,
    configFields: [
      {
        name: 'cronExpression',
        label: 'Schedule (Cron)',
        type: 'text',
        required: true,
        placeholder: '0 */5 * * * * (every 5 minutes)'
      }
    ]
  }
];

export const AVAILABLE_ACTIONS = [
  {
    id: 'WEBHOOK_POST',
    name: 'Send Webhook',
    description: 'Makes a POST request to a specified URL',
    icon: 'SendOutlined',
    requiresConnection: false,
    configFields: [
      {
        name: 'url',
        label: 'Webhook URL',
        type: 'text',
        required: true,
        placeholder: 'https://example.com/webhook'
      },
      {
        name: 'method',
        label: 'HTTP Method',
        type: 'select',
        required: true,
        defaultValue: 'POST',
        options: [
          { value: 'POST', label: 'POST' },
          { value: 'PUT', label: 'PUT' },
          { value: 'PATCH', label: 'PATCH' }
        ]
      },
      {
        name: 'headers',
        label: 'Headers (JSON)',
        type: 'textarea',
        required: false,
        placeholder: '{"Content-Type": "application/json", "Authorization": "Bearer token"}'
      },
      {
        name: 'payload',
        label: 'Payload (JSON)',
        type: 'textarea',
        required: true,
        placeholder: '{"message": "Hello from RelayPoint!", "data": "{{trigger.payload}}"}'
      }
    ]
  },
  {
    id: 'SEND_EMAIL_SMTP',
    name: 'Send Email (Gmail)',
    description: 'Sends an email using Gmail',
    icon: 'MailOutlined',
    requiresConnection: true,
    connectionService: 'google',
    configFields: [
      {
        name: 'to',
        label: 'To',
        type: 'text',
        required: true,
        placeholder: 'recipient@example.com'
      },
      {
        name: 'subject',
        label: 'Subject',
        type: 'text',
        required: true,
        placeholder: 'Email subject'
      },
      {
        name: 'body',
        label: 'Body',
        type: 'textarea',
        required: true,
        placeholder: 'Email content. Use {{trigger.payload.subject}} for dynamic content.'
      },
      {
        name: 'isHtml',
        label: 'HTML Email',
        type: 'checkbox',
        required: false,
        defaultValue: false
      }
    ]
  },
  {
    id: 'GOOGLE_SHEETS_ADD_ROW',
    name: 'Add Row to Google Sheets',
    description: 'Adds a new row to a Google Sheet',
    icon: 'PlusOutlined',
    requiresConnection: true,
    connectionService: 'google',
    configFields: [
      {
        name: 'spreadsheetId',
        label: 'Spreadsheet ID',
        type: 'text',
        required: true,
        placeholder: 'Enter the ID from the Google Sheet URL'
      },
      {
        name: 'sheetName',
        label: 'Sheet Name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Sheet1'
      },
      {
        name: 'rowData',
        label: 'Row Data (comma-separated)',
        type: 'text',
        required: true,
        placeholder: 'Value1,Value2,Value3'
      }
    ]
  },
  {
    id: 'SOLANA_SEND_SOL',
    name: 'Send SOL',
    description: 'Sends SOL tokens to a specified address',
    icon: 'WalletOutlined',
    requiresConnection: true,
    connectionService: 'solana',
    configFields: [
      {
        name: 'recipient',
        label: 'Recipient Address',
        type: 'text',
        required: true,
        placeholder: 'Enter Solana wallet address'
      },
      {
        name: 'amount',
        label: 'Amount (SOL)',
        type: 'number',
        required: true,
        placeholder: '0.1',
        step: '0.000001'
      },
      {
        name: 'memo',
        label: 'Memo (optional)',
        type: 'text',
        required: false,
        placeholder: 'Transaction memo'
      }
    ]
  }
];

// Helper functions
export const getTriggerById = (id) => AVAILABLE_TRIGGERS.find(trigger => trigger.id === id);
export const getActionById = (id) => AVAILABLE_ACTIONS.find(action => action.id === id);

export const getTriggersByService = (service) =>
  AVAILABLE_TRIGGERS.filter(trigger =>
    !trigger.requiresConnection || trigger.connectionService === service
  );

export const getActionsByService = (service) =>
  AVAILABLE_ACTIONS.filter(action =>
    !action.requiresConnection || action.connectionService === service
  );
