import { asyncHandler } from '#util/asyncHandler.js';
import { ApiResponse } from '#util/ApiResponse.js';
import * as webhookService from './webhook.service.js';

export const handleWebhook = asyncHandler(async (req, res) => {
  const { triggerId } = req.params;
  const payload = req.body;

  if (!triggerId) {
    throw ApiError.badRequest("Missing trigger ID");
  }

  const result = await webhookService.processWebhookTrigger(triggerId, payload);

  return ApiResponse
    .success(result, "Webhook received and ingestion started", 202)
    .withRequest(req)
    .send(res);
});

