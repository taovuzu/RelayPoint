import request from '@/request/request';

export const getWebhookUrl = (relayId) => request.webhook.getUrl(relayId);
export const regenerateWebhookUrl = (relayId) => request.webhook.regenerateUrl(relayId);
export const catchWebhook = (userId, relayId, webhookData) => request.webhook.catch(userId, relayId, webhookData);
