import defineTrigger from '#apps/helpers/define-trigger.js';
import * as Crypto from 'node:crypto';

export default defineTrigger({
  name: 'New Database Item',
  key: 'newDatabaseItem',
  type: 'nango_sync',
  description: 'Triggers when a new item is added to a Notion database',
  arguments: [
    {
      label: 'Database',
      key: 'database',
      type: 'dropdown',
      required: true,
      variables: false,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [
          {
            name: 'key',
            value: 'listDatabases',
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
        object: 'page',
        id: '12345-abcde',
        created_time: '2023-01-01T00:00:00.000Z',
        properties: {
          Name: {
            title: [
              { plain_text: 'Sample Item' }
            ]
          }
        }
      },
      meta: {
        internalId: Crypto.randomUUID(),
      },
    });
  },
});
