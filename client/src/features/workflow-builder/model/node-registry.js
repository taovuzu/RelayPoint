import { Webhook, Mail, MessageSquare, Github, FileText, CreditCard, ShoppingBag, Gamepad2, CheckSquare, ListTodo, Users, Calendar, Phone, MessagesSquare, HelpCircle, Columns, CheckCircle2, Cloud } from 'lucide-react';

export const TRIGGER_REGISTRY = {
  'webhook': {
    label: 'Webhook',
    icon: Webhook,
    color: 'border-blue-500',
    description: 'Trigger workflow when a Webhook is received.',
    configFields: [
      { name: 'path', type: 'text', label: 'Custom Path (Optional)', placeholder: 'e.g. /my-custom-hook' }
    ]
  },
  'github-new-issue': {
    label: 'GitHub Issue',
    icon: Github,
    color: 'border-zinc-700',
    description: 'Trigger when a new issue is created in a repository.',
    configFields: [
      { name: 'repo', type: 'text', label: 'Repository', placeholder: 'owner/repo' }
    ]
  },
  'slack-new-message': {
    label: 'Slack Message',
    icon: MessageSquare,
    color: 'border-purple-500',
    description: 'Trigger when a new message is posted in a channel.',
    configFields: [
      { name: 'channel', type: 'text', label: 'Channel ID', placeholder: 'C01234567' }
    ]
  },
  'gmail-new-email': {
    label: 'New Email',
    icon: Mail,
    color: 'border-red-500',
    description: 'Trigger when a new email matches criteria.',
    configFields: [
      { name: 'query', type: 'text', label: 'Search Query', placeholder: 'from:boss@company.com' }
    ]
  },
  'stripe': { label: 'Stripe Event', icon: CreditCard, color: 'border-blue-600', description: 'Trigger on payment events', configFields: [{ name: 'event', type: 'text', label: 'Event Type', placeholder: 'charge.succeeded' }] },
  'shopify': { label: 'Shopify Order', icon: ShoppingBag, color: 'border-green-600', description: 'Trigger on new orders', configFields: [{ name: 'store', type: 'text', label: 'Store Name', placeholder: 'my-store' }] },
  'discord': { label: 'Discord Message', icon: Gamepad2, color: 'border-indigo-500', description: 'Trigger on channel messages', configFields: [{ name: 'channel', type: 'text', label: 'Channel ID' }] },
  'linear': { label: 'Linear Issue', icon: CheckSquare, color: 'border-purple-600', description: 'Trigger on issue updates', configFields: [{ name: 'team', type: 'text', label: 'Team Key' }] },
  'jira': { label: 'Jira Ticket', icon: ListTodo, color: 'border-blue-500', description: 'Trigger on ticket creation', configFields: [{ name: 'project', type: 'text', label: 'Project Key' }] },
  'typeform': { label: 'Typeform Submit', icon: FileText, color: 'border-gray-800', description: 'Trigger on form submit', configFields: [{ name: 'formId', type: 'text', label: 'Form ID' }] },
  'mailchimp': { label: 'Mailchimp Sub', icon: Users, color: 'border-yellow-500', description: 'Trigger on new subscriber', configFields: [{ name: 'listId', type: 'text', label: 'List ID' }] },
  'hubspot': { label: 'Hubspot Contact', icon: Users, color: 'border-orange-500', description: 'Trigger on contact creation', configFields: [{ name: 'portalId', type: 'text', label: 'Portal ID' }] },
  'calendly': { label: 'Calendly Event', icon: Calendar, color: 'border-blue-400', description: 'Trigger on scheduled event', configFields: [{ name: 'user', type: 'text', label: 'User URI' }] },
  'twilio': { label: 'Twilio SMS', icon: Phone, color: 'border-red-600', description: 'Trigger on received SMS', configFields: [{ name: 'number', type: 'text', label: 'Phone Number' }] },
  'intercom': { label: 'Intercom Msg', icon: MessagesSquare, color: 'border-blue-500', description: 'Trigger on user message', configFields: [{ name: 'workspace', type: 'text', label: 'Workspace ID' }] },
  'zendesk': { label: 'Zendesk Ticket', icon: HelpCircle, color: 'border-green-700', description: 'Trigger on new ticket', configFields: [{ name: 'group', type: 'text', label: 'Group ID' }] },
  'trello': { label: 'Trello Card', icon: Columns, color: 'border-blue-600', description: 'Trigger on card creation', configFields: [{ name: 'board', type: 'text', label: 'Board ID' }] },
  'asana': { label: 'Asana Task', icon: CheckCircle2, color: 'border-pink-500', description: 'Trigger on new task', configFields: [{ name: 'project', type: 'text', label: 'Project ID' }] },
  'salesforce': { label: 'Salesforce Lead', icon: Cloud, color: 'border-blue-400', description: 'Trigger on lead creation', configFields: [{ name: 'object', type: 'text', label: 'Object Type', placeholder: 'Lead' }] }
};


export const ACTION_REGISTRY = {
  'send-email': {
    label: 'Send Email',
    icon: Mail,
    color: 'border-red-500',
    service: 'GMAIL',
    description: 'Send an email via Gmail.',
    configFields: [
      { name: 'to', type: 'text', label: 'To', placeholder: 'recipient@example.com' },
      { name: 'subject', type: 'text', label: 'Subject', placeholder: 'Hello from RelayPoint' },
      { name: 'body', type: 'textarea', label: 'Body', placeholder: 'Email content...' }
    ]
  },
  'post-message': {
    label: 'Post Message',
    icon: MessageSquare,
    color: 'border-purple-500',
    service: 'SLACK',
    description: 'Post a message to a Slack channel.',
    configFields: [
      { name: 'channel', type: 'text', label: 'Channel', placeholder: '#general or channel ID' },
      { name: 'text', type: 'textarea', label: 'Message', placeholder: 'Hello team!' }
    ]
  },
  'create-issue': {
    label: 'Create Issue',
    icon: Github,
    color: 'border-zinc-700',
    service: 'GITHUB',
    description: 'Create a new issue in GitHub.',
    configFields: [
      { name: 'repo', type: 'text', label: 'Repository', placeholder: 'owner/repo' },
      { name: 'title', type: 'text', label: 'Issue Title', placeholder: 'Bug: Something broke' },
      { name: 'body', type: 'textarea', label: 'Issue Body', placeholder: 'Describe the issue...' }
    ]
  },
  'create-page': {
    label: 'Create Page',
    icon: FileText,
    color: 'border-foreground',
    service: 'NOTION',
    description: 'Create a new page/database item in Notion.',
    configFields: [
      { name: 'database_id', type: 'text', label: 'Database ID', placeholder: 'Notion DB ID' },
      { name: 'title', type: 'text', label: 'Page Title', placeholder: 'New Meeting Notes' },
      { name: 'content', type: 'textarea', label: 'Content', placeholder: 'Page content...' }
    ]
  }
};
