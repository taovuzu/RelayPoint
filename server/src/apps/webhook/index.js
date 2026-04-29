import defineApp from '#apps/helpers/define-app.js';
import triggers from '#apps/webhook/triggers/index.js';

export default defineApp({
  name: 'Webhook',
  key: 'webhook',
  service: 'WEBHOOK',
  apiBaseUrl: '',
  iconUrl: '/apps/webhook/icon.svg',
  primaryColor: '#000000',
  supportsConnections: false,
  beforeRequest: [],
  triggers,
  actions: [],
  dynamicData: [],
});
