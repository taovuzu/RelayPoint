import defineApp from '#apps/helpers/define-app.js';
import addAuthHeader from '#apps/notion/common/add-auth-header.js';
import addNotionVersionHeader from '#apps/notion/common/add-notion-version-header.js';
import triggers from '#apps/notion/triggers/index.js';
import actions from '#apps/notion/actions/index.js';
import dynamicData from '#apps/notion/dynamic-data/index.js';

export default defineApp({
  name: 'Notion',
  key: 'notion',
  service: 'NOTION',
  apiBaseUrl: 'https://api.notion.com',
  iconUrl: '/apps/notion/icon.svg',
  primaryColor: '#000000',
  supportsConnections: true,
  beforeRequest: [addAuthHeader, addNotionVersionHeader],
  triggers,
  actions,
  dynamicData,
});
