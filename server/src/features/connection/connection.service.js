import prisma from '#db/index.db.js';
import { ApiError } from '#util/ApiError.js';
import logger from '#util/logger.js';
import { nango } from '#util/nango.js';
import { NANGO_INTEGRATION_IDS, NANGO_TO_SERVICE_MAPPING } from '#constant.js';


export const mapProviderToService = (providerKey) => {
  if (!providerKey) {
    throw ApiError.badRequest('Provider key is missing for service mapping.');
  }
 
  const service = NANGO_TO_SERVICE_MAPPING[providerKey] || NANGO_TO_SERVICE_MAPPING[providerKey.toLowerCase()];

  if (!service) {
    throw ApiError.badRequest(`Unsupported or unknown integration provider: ${providerKey}`);
  }

  return service;
};

const tokenExchangeStrategies = {
  GMAIL: async (connectionId) => nango.getConnection(NANGO_INTEGRATION_IDS.GMAIL, connectionId),
  SLACK: async (connectionId) => nango.getConnection(NANGO_INTEGRATION_IDS.SLACK, connectionId),
  GITHUB: async (connectionId) => nango.getConnection(NANGO_INTEGRATION_IDS.GITHUB, connectionId),
  NOTION: async (connectionId) => nango.getConnection(NANGO_INTEGRATION_IDS.NOTION, connectionId),
};

export const getAvailableIntegrations = () => Object.values(NANGO_INTEGRATION_IDS);


export const createConnection = async (userId, { service: rawService, connectionId, accountIdentifier }) => {
  try {
    const service = mapProviderToService(rawService);
    const exchangeStrategy = tokenExchangeStrategies[service];

    logger.debug(`Creating/Updating connection for user ${userId}: rawService=${rawService}, mappedService=${service}, connectionId=${connectionId}`);

    if (!exchangeStrategy) {
      throw ApiError.badRequest(`Unsupported service type: ${service}`);
    }

    await exchangeStrategy(connectionId);

    const connection = await prisma.connection.upsert({
      where: {
        userId_service_isActive: {
          userId,
          service,
          isActive: true
        }
      },
      update: {
        accountIdentifier: accountIdentifier || null,
        nangoConnectionId: connectionId,
        lastUsedAt: new Date()
      },
      create: {
        userId,
        service,
        accountIdentifier: accountIdentifier || null,
        nangoConnectionId: connectionId,
      },
      select: {
        id: true,
        service: true,
        accountIdentifier: true,
        isActive: true,
        createdAt: true
      },
    });

    logger.info(`Connection created successfully for user ${userId} on service ${service}`);
    return connection;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Error creating/updating connection for user ${userId}:`, { error: error.message });
    throw ApiError.internal('Failed to create connection securely');
  }
};

export const getConnections = async (userId) => {
  try {
    const connections = await prisma.connection.findMany({
      where: { userId },
      select: {
        id: true,
        service: true,
        accountIdentifier: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
    });

    return connections;
  } catch (error) {
    logger.error(`Error fetching connections for user ${userId}:`, { error: error.message });
    throw ApiError.internal('Failed to fetch connections');
  }
};

export const getConnectionById = async (userId, connectionId) => {
  try {
    const connection = await prisma.connection.findFirst({
      where: {
        id: connectionId,
        userId,
      },
      select: {
        id: true,
        service: true,
        accountIdentifier: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true
      }
    });

    if (!connection) {
      throw ApiError.notFound('Connection not found');
    }
    return connection;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Error fetching connection ${connectionId} for user ${userId}:`, { error: error.message });
    throw ApiError.internal('Failed to fetch connection details');
  }
};

export const deleteConnection = async (userId, connectionId) => {
  try {
    const { count } = await prisma.connection.deleteMany({
      where: {
        id: connectionId,
        userId
      }
    });

    if (count === 0) {
      throw ApiError.notFound('Connection not found or already deleted');
    }

    logger.info(`Connection ${connectionId} deleted successfully by user ${userId}`);
    return { message: 'Connection deleted successfully' };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Error deleting connection ${connectionId} for user ${userId}:`, { error: error.message });
    throw ApiError.internal('Failed to delete connection');
  }
};


export const getNangoConnectionId = async (userId, service) => {
  try {
    const connection = await prisma.connection.findFirst({
      where: { userId, service, isActive: true },
      select: { nangoConnectionId: true }
    });

    if (!connection) {
      throw ApiError.notFound(`No active ${service} connection found. Please connect your account first.`);
    }

    return connection.nangoConnectionId;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Error fetching Nango connection ID for ${service} (user ${userId}):`, { error: error.message });
    throw ApiError.internal('Failed to retrieve service connection mapping');
  }
};
export const healConnectionTokens = async (userId, service) => {
  try {
    const connection = await prisma.connection.findFirst({
      where: { userId, service },
    });

    if (!connection) {
      throw ApiError.notFound(`Connection for ${service} not found`);
    }

    const integrationId = NANGO_INTEGRATION_IDS[service];
    if (!integrationId) {
      throw ApiError.badRequest(`Unsupported service for healing: ${service}`);
    }

    await nango.getConnection(integrationId, connection.nangoConnectionId, { force_refresh: true });

    const updated = await prisma.connection.update({
      where: { id: connection.id },
      data: {
        isActive: true,
        lastUsedAt: new Date(),
      },
      select: {
        id: true,
        service: true,
        isActive: true,
        lastUsedAt: true,
      }
    });

    logger.info(`Auth healed successfully for user ${userId} on service ${service}`);
    return updated;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error(`Error healing auth for service ${service} (user ${userId}):`, { error: error.message });
    throw ApiError.internal('Failed to refresh service credentials');
  }
};

export const createConnectSession = async (userId, requestedIntegrations = []) => {
  try {
    const availableIntegrations = getAvailableIntegrations();

    const allowedIntegrations = requestedIntegrations.length > 0
      ? requestedIntegrations.filter(id => availableIntegrations.includes(id))
      : undefined;

    const response = await nango.createConnectSession({
      end_user: {
        id: userId,
      },
      allowed_integrations: allowedIntegrations,
    });

    return response.data.token;
  } catch (error) {
    const nangoError = error.response?.data?.error;
    logger.error(`Error creating Nango connect session for user ${userId}:`, {
      error: error.message,
      response: error.response?.data,
      requestedIntegrations,
      availableIntegrations: getAvailableIntegrations()
    });

    if (nangoError?.code === 'resource_capped') {
      throw ApiError.conflict('Connection limit reached on integration provider. Please remove unused connections or upgrade your Nango plan.');
    }

    throw ApiError.internal('Failed to initiate secure connection flow');
  }
};


// ref: https://www.prisma.io/docs/orm/prisma-client/queries/crud
// ref: https://nango.dev/docs/implementation-guides/platform/auth/implement-api-auth#simplified-flow-for-development
// ref: https://nango.dev/docs/reference/sdks/node

