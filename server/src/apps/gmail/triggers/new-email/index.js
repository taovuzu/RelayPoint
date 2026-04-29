import defineTrigger from '#apps/helpers/define-trigger.js';
import * as Crypto from 'node:crypto';

export default defineTrigger({
  name: 'New Email',
  key: 'newEmail',
  type: 'nango_sync',
  description: 'Triggers when a new email is received in Gmail',
  arguments: [],

  async run($) {
    $.pushTriggerItem({
      raw: $.request,
      meta: {
        internalId: Crypto.randomUUID(),
      },
    });
  },

  async testRun($) {
    $.pushTriggerItem({
      raw: {
        id: '12345',
        subject: 'Sample Email',
        from: 'test@example.com',
        snippet: 'This is a test email snippet',
      },
      meta: {
        internalId: Crypto.randomUUID(),
      },
    });
  },
});
