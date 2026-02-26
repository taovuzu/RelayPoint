import { nango } from '#util/nango.js';
import { logger } from '#util/logger.js';
import { ApiError } from '#util/ApiError.js';

export const sendEmail = async (connectionId, emailData) => {
  const { to, subject, body } = emailData;

  if (!connectionId) {
    throw ApiError.badRequest('Connection ID is required for Gmail integration');
  }
  if (!to) {
    throw ApiError.badRequest('Recipient email address (to) is required');
  }
  if (!subject) {
    throw ApiError.badRequest('Email subject is required');
  }
  if (!body) {
    throw ApiError.badRequest('Email body is required');
  }

  try {
    logger.debug('Preparing to send Gmail message via Nango Proxy', { connectionId, to, subject });

    // RFC 2822 compliant message string
    const emailHeader = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      body
    ].join('\r\n');

    const base64Msg = Buffer.from(emailHeader).toString('base64url');

    const response = await nango.proxy({
      method: 'POST',
      endpoint: '/users/me/messages/send',
      providerConfigKey: 'google-mail',
      connectionId,
      retries: 3,
      data: { raw: base64Msg }
    });

    logger.info('Gmail message sent successfully', {
      connectionId,
      messageId: response.data.id,
      threadId: response.data.threadId
    });

    return {
      messageId: response.data.id,
      threadId: response.data.threadId
    };
  } catch (error) {
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.error?.message || error.message;

    logger.error('Failed to send Gmail message', {
      connectionId,
      status,
      error: errorMessage,
      nangoError: error.response?.data
    });

    if (status === 401) {
      throw ApiError.unauthorized('Gmail authentication expired or invalid. Please re-connect your account.');
    }

    if (status === 403) {
      throw ApiError.forbidden(`Gmail API access forbidden: ${errorMessage}`);
    }

    if (status === 429) {
      throw new ApiError(429, 'Gmail API rate limit exceeded. Please try again later.');
    }

    throw new ApiError(
      status,
      `Gmail API error (${status}): ${errorMessage}`
    );
  }
};

// ref: https://developers.google.com/gmail/api/reference/rest/v1/users.messages/send
