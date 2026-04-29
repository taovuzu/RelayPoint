import defineApp from '#apps/helpers/define-app.js';
import addAuthHeader from '#apps/github/common/add-auth-header.js';
import triggers from '#apps/github/triggers/index.js';
import actions from '#apps/github/actions/index.js';
import dynamicData from '#apps/github/dynamic-data/index.js';

export default defineApp({
  name: 'GitHub',
  key: 'github',
  service: 'GITHUB',
  apiBaseUrl: 'https://api.github.com',
  iconUrl: '/apps/github/icon.svg',
  primaryColor: '#000000',
  supportsConnections: true,
  beforeRequest: [addAuthHeader],
  triggers,
  actions,
  dynamicData,
});
