import { asyncHandler } from '#util/asyncHandler.js';
import { ApiResponse } from '#util/ApiResponse.js';
import logger from '#util/logger.js';
import * as connectionService from '#features/connection/connection.service.js';
import { mapProviderToService } from '#features/connection/connection.service.js';


export const handleNangoAuthWebhook = asyncHandler(async (req, res) => {
  const payload = req.body;

  if (payload.type === 'auth' && payload.operation === 'creation' && payload.success) {
    const { connectionId, providerConfigKey, tags } = payload;
    const userId = tags?.end_user_id;

    if (!userId) {
      logger.error('Nango auth webhook received but missing end_user_id tag', { payload });
      return ApiResponse.error("Missing end_user_id tag", 400).send(res);
    }

    logger.info(`Nango auth creation webhook received for user ${userId}, service ${providerConfigKey}`);

    const serviceName = mapProviderToService(providerConfigKey);

    try {
      await connectionService.createConnection(userId, {
        service: serviceName,
        connectionId: connectionId,
        accountIdentifier: tags.end_user_email || tags.end_user_display_name || 'Unknown Account'
      });
      logger.info(`Connection auto-saved for user ${userId} via Nango webhook`);
    } catch (error) {
      logger.error(`Failed to auto-save connection via Nango webhook: ${error.message}`, { userId, serviceName });
    }
  }

  return ApiResponse
    .success(null, "Webhook received and processed", 200)
    .send(res);
});

// ref: https://nango.dev/docs/implementation-guides/platform/auth/implement-api-auth
// ref: https://nango.dev/docs/reference/sdks/node

