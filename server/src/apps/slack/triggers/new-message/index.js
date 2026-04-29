import defineTrigger from '#apps/helpers/define-trigger.js';
import * as Crypto from 'node:crypto';

export default defineTrigger({
  name: 'New Message',
  key: 'newMessage',
  type: 'nango_sync',
  description: 'Triggers when a new message is posted in a Slack channel',
  arguments: [
    {
      label: 'Channel',
      key: 'channel',
      type: 'dropdown',
      required: true,
      variables: false,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [
          {
            name: 'key',
            value: 'listChannels',
          },
        ],
      },
    },
  ],

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
        type: 'message',
        user: 'U1234567',
        text: 'Hello world!',
        ts: '1620000000.000100',
      },
      meta: {
        internalId: Crypto.randomUUID(),
      },
    });
  },
});
