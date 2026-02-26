import { nango } from '#util/nango.js';
import { logger } from '#util/logger.js';
import { ApiError } from '#util/ApiError.js';

export const postMessage = async (connectionId, messageData) => {
  const { channel, text } = messageData;

  if (!connectionId) {
    throw ApiError.badRequest('Connection ID is required for Slack integration');
  }
  if (!channel) {
    throw ApiError.badRequest('Slack channel is required');
  }
  if (!text) {
    throw ApiError.badRequest('Slack message text is required');
  }

  try {
    logger.debug('Preparing to post Slack message via Nango Proxy', { connectionId, channel });

    const response = await nango.proxy({
      method: 'POST',
      endpoint: '/chat.postMessage',
      providerConfigKey: 'slack',
      connectionId,
      retries: 3,
      data: { channel, text }
    });

    if (!response.data.ok) {
        const slackError = response.data.error || 'Unknown Slack error';
        logger.error('Slack API returned an error', { connectionId, channel, slackError });
        
        if (slackError === 'channel_not_found') {
            throw ApiError.notFound(`Slack channel "${channel}" not found or bot not invited.`);
        }
        if (slackError === 'not_in_channel') {
            throw ApiError.forbidden(`Bot is not in channel "${channel}". Please invite the bot first.`);
        }
        
        throw new ApiError(400, `Slack API error: ${slackError}`);
    }

    logger.info('Slack message posted successfully', {
      connectionId,
      channel: response.data.channel,
      ts: response.data.ts
    });

    return {
      ok: response.data.ok,
      ts: response.data.ts,
      channel: response.data.channel
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;

    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.error || error.message;

    logger.error('Failed to post Slack message (Network/Proxy level)', {
      connectionId,
      status,
      error: errorMessage,
      nangoError: error.response?.data
    });

    if (status === 401) {
      throw ApiError.unauthorized('Slack authentication expired or invalid. Please re-connect your account.');
    }

    if (status === 429) {
      throw new ApiError(429, 'Slack API rate limit exceeded. Please try again later.');
    }

    throw new ApiError(
      status,
      `Slack API error (${status}): ${errorMessage}`
    );
  }
};

// ref: https://api.slack.com/methods/chat.postMessage
