import defineApp from '#apps/helpers/define-app.js';
import addAuthHeader from '#apps/slack/common/add-auth-header.js';
import actions from '#apps/slack/actions/index.js';
import triggers from '#apps/slack/triggers/index.js';
import dynamicData from '#apps/slack/dynamic-data/index.js';

export default defineApp({
  name: 'Slack',
  key: 'slack',
  service: 'SLACK',
  apiBaseUrl: 'https://slack.com/api',
  iconUrl: '/apps/slack/icon.svg',
  primaryColor: '#4A154B',
  supportsConnections: true,
  beforeRequest: [addAuthHeader],
  triggers,
  actions,
  dynamicData,
});
