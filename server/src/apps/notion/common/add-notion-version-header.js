import envConfig from '#config/env.config.js';

const addNotionVersionHeader = ($, requestConfig) => {
  requestConfig.headers['Notion-Version'] = envConfig.NOTION_API_VERSION;
  return requestConfig;
};

export default addNotionVersionHeader;
