import { nango } from '#util/nango.js';
import { logger } from '#util/logger.js';
import { ApiError } from '#util/ApiError.js';

export async function createPage(connectionId, pageData) {
  const { databaseId, properties } = pageData;

  if (!connectionId) {
    throw ApiError.badRequest('Connection ID is required for Notion integration');
  }
  if (!databaseId) {
    throw ApiError.badRequest('Notion database ID is required');
  }
  if (!properties || typeof properties !== 'object') {
    throw ApiError.badRequest('Notion page properties are required and must be an object');
  }

  try {
    logger.debug('Preparing to create Notion page via Nango Proxy', { connectionId, databaseId });

    const response = await nango.proxy({
      method: 'POST',
      endpoint: '/v1/pages',
      providerConfigKey: 'notion',
      connectionId,
      retries: 3,
      headers: { 
        'Notion-Version': '2022-06-28'
      },
      data: { 
        parent: { database_id: databaseId }, 
        properties 
      }
    });

    logger.info('Notion page created successfully', {
      connectionId,
      databaseId,
      pageId: response.data.id
    });

    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;

    logger.error('Failed to create Notion page', {
      connectionId,
      databaseId,
      status,
      error: errorMessage,
      nangoError: error.response?.data
    });

    if (status === 401) {
      throw ApiError.unauthorized('Notion authentication expired or invalid. Please re-connect your account.');
    }

    if (status === 404) {
      throw ApiError.notFound(`Notion database "${databaseId}" not found or unauthorized access.`);
    }

    if (status === 429) {
      throw new ApiError(429, 'Notion API rate limit exceeded. Please try again later.');
    }

    throw new ApiError(
      status,
      `Notion API error (${status}): ${errorMessage}`
    );
  }
}


// ref: https://developers.notion.com/reference/post-page
