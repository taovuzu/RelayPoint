import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { AVAILABLE_TRIGGERS, AVAILABLE_ACTIONS } from '../constants.js';

export const suggestRelay = asyncHandler(async (req, res) => {
  const { description } = req.body;

  if (!description || typeof description !== 'string') {
    throw ApiError.badRequest('Description is required');
  }

  const suggestion = generateRelaySuggestion(description);

  return ApiResponse
    .success({ suggestion }, 'Relay suggestion generated successfully', 200)
    .withRequest(req)
    .send(res);
});

const generateRelaySuggestion = (description) => {
  const lowerDesc = description.toLowerCase();
  let triggerType = 'INCOMING_WEBHOOK';
  if (lowerDesc.includes('schedule') || lowerDesc.includes('time') || lowerDesc.includes('daily') || lowerDesc.includes('weekly')) {
    triggerType = 'SCHEDULE';
  } else if (lowerDesc.includes('email') && lowerDesc.includes('receive')) {
    triggerType = 'EMAIL_RECEIVED';
  }

  const actions = [];
  let actionOrder = 0;

  if (lowerDesc.includes('email') && (lowerDesc.includes('send') || lowerDesc.includes('notify'))) {
    actions.push({
      type: 'SEND_EMAIL_SMTP',
      order: actionOrder++,
      name: 'Send Email',
      description: 'Send an email notification',
      details: {
        to: '{{trigger.email}}',
        subject: 'Notification from RelayPoint',
        text: 'This is an automated email from your RelayPoint workflow.',
        html: '<p>This is an automated email from your RelayPoint workflow.</p>'
      }
    });
  }

  if (lowerDesc.includes('webhook') || lowerDesc.includes('api') || lowerDesc.includes('post')) {
    actions.push({
      type: 'WEBHOOK_POST',
      order: actionOrder++,
      name: 'Send Webhook',
      description: 'Send data to another service',
      details: {
        url: 'https://example.com/webhook',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{{trigger}}'
      }
    });
  }

  if (lowerDesc.includes('wait') || lowerDesc.includes('delay') || lowerDesc.includes('pause')) {
    actions.push({
      type: 'DELAY',
      order: actionOrder++,
      name: 'Wait',
      description: 'Add a delay before next action',
      details: { duration: '5000' }
    });
  }

  if (lowerDesc.includes('if') || lowerDesc.includes('condition') || lowerDesc.includes('check')) {
    actions.push({
      type: 'CONDITIONAL',
      order: actionOrder++,
      name: 'Check Condition',
      description: 'Execute based on a condition',
      details: { condition: '{{trigger.value}} > 100' }
    });
  }

  if (actions.length === 0) {
    actions.push({
      type: 'SEND_EMAIL_SMTP',
      order: 0,
      name: 'Send Email',
      description: 'Send an email notification',
      details: {
        to: '{{trigger.email}}',
        subject: 'Notification from RelayPoint',
        text: 'This is an automated email from your RelayPoint workflow.',
        html: '<p>This is an automated email from your RelayPoint workflow.</p>'
      }
    });
  }

  const relayName = generateRelayName(description);
  return { name: relayName, description, trigger: { type: triggerType, config: {} }, actions };
};

const generateRelayName = (description) => {
  const words = description.toLowerCase().split(' ');
  const keyWords = words.filter(word => !['when', 'if', 'then', 'send', 'to', 'the', 'a', 'an', 'and', 'or', 'but'].includes(word));
  if (keyWords.length >= 2) {
    return keyWords.slice(0, 2).map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
  return 'My Relay';
};


