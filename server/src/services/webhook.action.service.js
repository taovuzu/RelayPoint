import axios from 'axios';
import logger from '../utils/logger.js';

export class WebhookActionService {

  static async sendWebhook(options) {
    const {
      url,
      payload = {},
      headers = {},
      method = 'POST',
      timeout = 30000,
      retries = 3
    } = options;

    if (!url) {
      throw new Error('URL is required for webhook action');
    }

    try {
      new URL(url);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'User-Agent': 'RelayPoint-Webhook/1.0',
      ...headers
    };

    const config = {
      method: method.toLowerCase(),
      url,
      headers: defaultHeaders,
      timeout,
      validateStatus: (status) => status < 500,
      maxRedirects: 5
    };

    if (['post', 'put', 'patch'].includes(method.toLowerCase())) {
      config.data = payload;
    } else if (['get', 'delete'].includes(method.toLowerCase())) {
      config.params = payload;
    }

    let lastError;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        logger.info('Sending webhook request', {
          url,
          method,
          attempt,
          payloadSize: JSON.stringify(payload).length
        });

        const response = await axios(config);

        logger.info('Webhook request successful', {
          url,
          method,
          status: response.status,
          responseTime: response.headers['x-response-time'] || 'unknown'
        });

        return {
          success: true,
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          headers: response.headers,
          config: {
            url: response.config.url,
            method: response.config.method,
            timeout: response.config.timeout
          }
        };

      } catch (error) {
        lastError = error;

        logger.warn('Webhook request failed', {
          url,
          method,
          attempt,
          error: error.message,
          status: error.response?.status,
          isRetryable: this.isRetryableError(error)
        });

        if (!this.isRetryableError(error) || attempt === retries) {
          break;
        }

        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        await this.sleep(delay);
      }
    }

    logger.error('Webhook request failed after all retries', {
      url,
      method,
      attempts: retries,
      error: lastError.message,
      status: lastError.response?.status
    });

    throw new Error(`Webhook request failed: ${lastError.message}`);
  }

  static isRetryableError(error) {
    if (!error.response) {
      return true;
    }

    const status = error.response.status;

    if (status >= 500) {
      return true;
    }

    if ([408, 429, 502, 503, 504].includes(status)) {
      return true;
    }

    return false;
  }

  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static async sendWebhookWithTemplate(options, variables = {}) {
    let processedUrl = options.url;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      processedUrl = processedUrl.replace(new RegExp(placeholder, 'g'), value);
    }

    let processedPayload = JSON.parse(JSON.stringify(options.payload));
    processedPayload = this.substituteVariables(processedPayload, variables);

    let processedHeaders = { ...options.headers };
    for (const [key, value] of Object.entries(processedHeaders)) {
      if (typeof value === 'string') {
        for (const [varKey, varValue] of Object.entries(variables)) {
          const placeholder = `{{${varKey}}}`;
          processedHeaders[key] = value.replace(new RegExp(placeholder, 'g'), varValue);
        }
      }
    }

    return this.sendWebhook({
      ...options,
      url: processedUrl,
      payload: processedPayload,
      headers: processedHeaders
    });
  }

  static substituteVariables(obj, variables) {
    if (typeof obj === 'string') {
      let result = obj;
      for (const [key, value] of Object.entries(variables)) {
        const placeholder = `{{${key}}}`;
        result = result.replace(new RegExp(placeholder, 'g'), value);
      }
      return result;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.substituteVariables(item, variables));
    }

    if (obj && typeof obj === 'object') {
      const result = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.substituteVariables(value, variables);
      }
      return result;
    }

    return obj;
  }

  static async testWebhookUrl(url, options = {}) {
    try {
      const testOptions = {
        url,
        method: 'GET',
        timeout: 10000,
        retries: 1,
        ...options
      };

      const result = await this.sendWebhook(testOptions);

      return {
        success: true,
        reachable: true,
        status: result.status,
        responseTime: result.config?.timeout || 'unknown'
      };

    } catch (error) {
      return {
        success: false,
        reachable: false,
        error: error.message,
        status: error.response?.status
      };
    }
  }

  static validateWebhookConfig(config) {
    const errors = [];

    if (!config.url) {
      errors.push('URL is required');
    } else {
      try {
        new URL(config.url);
      } catch (error) {
        errors.push('Invalid URL format');
      }
    }

    if (config.method && !['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(config.method.toUpperCase())) {
      errors.push('Invalid HTTP method');
    }

    if (config.timeout && (typeof config.timeout !== 'number' || config.timeout < 1000)) {
      errors.push('Timeout must be a number >= 1000ms');
    }

    if (config.retries && (typeof config.retries !== 'number' || config.retries < 0 || config.retries > 10)) {
      errors.push('Retries must be a number between 0 and 10');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
