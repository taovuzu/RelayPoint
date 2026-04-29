import { asyncHandler } from '#util/asyncHandler.js';
import { ApiResponse } from '#util/ApiResponse.js';
import { ApiError } from '#util/ApiError.js';
import * as webhookService from './webhook.service.js';

export const handleWebhook = asyncHandler(async (req, res) => {
  const { triggerId } = req.params;
  const result = await webhookService.processWebhookTrigger(triggerId, {
    body: req.body,
    headers: req.headers,
    query: req.query,
  });

  return ApiResponse
    .success(result, "Webhook received and ingestion started", 202)
    .withRequest(req)
    .send(res);
});

