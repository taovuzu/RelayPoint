import { nango } from '#util/nango.js';
import { NANGO_INTEGRATION_IDS } from '#constant.js';
import { getNangoConnectionId } from '#features/connection/connection.service.js';
import prisma from '#db/index.db.js';
import logger from '#util/logger.js';

export async function createGlobalVariable({ app, userId, stepParameters, executionContext, workflowId, webhookUrl }) {
  const isInternalApp = app.key === 'webhook';
  let nangoConnectionId = null;
  let integrationId = null;

  if (app.supportsConnections) {
    nangoConnectionId = await getNangoConnectionId(userId, app.service);
    integrationId = NANGO_INTEGRATION_IDS[app.service];
  }

  const $ = {
    auth: { data: { accessToken: null } },
    step: { parameters: stepParameters },
    app,
    triggerOutput: { data: [] },
    actionOutput: { data: { raw: null } },
    webhookUrl,

    pushTriggerItem: (item) => { $.triggerOutput.data.push(item); },
    setActionItem: (item) => { $.actionOutput.data = item; },

    flow: {
      get remoteWebhookId() {
        return $.step.parameters.remoteWebhookId;
      },
      setRemoteWebhookId: async (id) => {
        $.step.parameters.remoteWebhookId = id;
        if (workflowId) {
          const relay = await prisma.relay.findUnique({ where: { id: workflowId } });
          if (relay) {
            const trigger = { ...relay.trigger, config: { ...relay.trigger.config, remoteWebhookId: id } };
            await prisma.relay.update({
              where: { id: workflowId },
              data: { trigger }
            });
          }
        }
      }
    },

    http: {
      get: async (endpoint, config = {}) => {
        if (isInternalApp) throw new Error('HTTP calls not supported for internal apps');
        
        let finalConfig = { ...config };
        finalConfig.headers = finalConfig.headers || {};
        for (const interceptor of app.beforeRequest || []) {
          finalConfig = interceptor($, finalConfig);
        }

        logger.debug(`[Nango Proxy] GET ${endpoint}`, { providerConfigKey: integrationId, connectionId: nangoConnectionId });
        try {
          const response = await nango.proxy({
            method: 'GET', endpoint, providerConfigKey: integrationId,
            connectionId: nangoConnectionId, headers: finalConfig.headers, ...finalConfig
          });
          return response;
        } catch (err) {
          const errorBody = err.response?.data || err.message;
          logger.error(`[Nango Proxy] GET ${endpoint} - FAILED`, { error: errorBody });
          throw err;
        }
      },
      post: async (endpoint, data, config = {}) => {
        if (isInternalApp) throw new Error('HTTP calls not supported for internal apps');

        let finalConfig = { ...config };
        finalConfig.headers = finalConfig.headers || {};
        for (const interceptor of app.beforeRequest || []) {
          finalConfig = interceptor($, finalConfig);
        }

        logger.info(`[Nango Proxy] POST ${endpoint}`, { providerConfigKey: integrationId, connectionId: nangoConnectionId, data });
        try {
          const response = await nango.proxy({
            method: 'POST', endpoint, providerConfigKey: integrationId,
            connectionId: nangoConnectionId, data, headers: finalConfig.headers, ...finalConfig
          });
          logger.info(`[Nango Proxy] POST ${endpoint} - SUCCESS`);
          return response;
        } catch (err) {
          const errorBody = err.response?.data || err.message;
          logger.error(`[Nango Proxy] POST ${endpoint} - FAILED`, { error: errorBody });
          throw err;
        }
      },
      patch: async (endpoint, data, config = {}) => {
        if (isInternalApp) throw new Error('HTTP calls not supported for internal apps');

        let finalConfig = { ...config };
        finalConfig.headers = finalConfig.headers || {};
        for (const interceptor of app.beforeRequest || []) {
          finalConfig = interceptor($, finalConfig);
        }

        logger.info(`[Nango Proxy] PATCH ${endpoint}`, { providerConfigKey: integrationId, connectionId: nangoConnectionId, data });
        try {
          const response = await nango.proxy({
            method: 'PATCH', endpoint, providerConfigKey: integrationId,
            connectionId: nangoConnectionId, data, headers: finalConfig.headers, ...finalConfig
          });
          logger.info(`[Nango Proxy] PATCH ${endpoint} - SUCCESS`);
          return response;
        } catch (err) {
          const errorBody = err.response?.data || err.message;
          logger.error(`[Nango Proxy] PATCH ${endpoint} - FAILED`, { error: errorBody });
          throw err;
        }
      },
      delete: async (endpoint, config = {}) => {
        if (isInternalApp) throw new Error('HTTP calls not supported for internal apps');

        let finalConfig = { ...config };
        finalConfig.headers = finalConfig.headers || {};
        for (const interceptor of app.beforeRequest || []) {
          finalConfig = interceptor($, finalConfig);
        }

        logger.info(`[Nango Proxy] DELETE ${endpoint}`, { providerConfigKey: integrationId, connectionId: nangoConnectionId });
        try {
          const response = await nango.proxy({
            method: 'DELETE', endpoint, providerConfigKey: integrationId,
            connectionId: nangoConnectionId, headers: finalConfig.headers, ...finalConfig
          });
          logger.info(`[Nango Proxy] DELETE ${endpoint} - SUCCESS`);
          return response;
        } catch (err) {
          const errorBody = err.response?.data || err.message;
          logger.error(`[Nango Proxy] DELETE ${endpoint} - FAILED`, { error: errorBody });
          throw err;
        }
      },
    },
  };

  if (app.supportsConnections && nangoConnectionId) {
    try {
      const connectionInfo = await nango.getConnection(integrationId, nangoConnectionId);
      $.auth.data.accessToken = connectionInfo.credentials.access_token;
      if (app.service === 'SLACK') {
        $.auth.data.botAccessToken = connectionInfo.credentials.access_token;
        $.auth.data.userAccessToken = connectionInfo.credentials.access_token;
      }
    } catch (err) {
      console.warn(`Failed to load token for ${app.service}:`, err.message);
    }
  }

  return $;
}
