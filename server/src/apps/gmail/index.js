import defineApp from '#apps/helpers/define-app.js';
import actions from '#apps/gmail/actions/index.js';
import triggers from '#apps/gmail/triggers/index.js';
import dynamicData from '#apps/gmail/dynamic-data/index.js';

export default defineApp({
  name: 'Gmail',
  key: 'gmail',
  service: 'GMAIL',
  apiBaseUrl: 'https://gmail.googleapis.com',
  iconUrl: '/apps/gmail/icon.svg',
  primaryColor: '#EA4335',
  supportsConnections: true,
  beforeRequest: [], 
  triggers,
  actions,
  dynamicData,
});
