import defineAction from '#apps/helpers/define-action.js';
import postMessage from '#apps/slack/actions/send-message-to-channel/post-message.js';

export default defineAction({
  name: 'Send a message to channel',
  key: 'sendMessageToChannel',
  description: 'Sends a message to a channel you specify.',
  arguments: [
    {
      label: 'Channel',
      key: 'channel',
      type: 'dropdown',
      required: true,
      description: 'Pick a channel to send the message to.',
      variables: true,
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
    {
      label: 'Message text',
      key: 'message',
      type: 'string',
      required: true,
      description: 'The content of your new message.',
      variables: true,
    },
    {
      label: 'Send as a bot?',
      key: 'sendAsBot',
      type: 'dropdown',
      required: false,
      value: false,
      description: 'If you choose no, this message will appear to come from you.',
      variables: true,
      options: [
        { label: 'Yes', value: true },
        { label: 'No', value: false },
      ],
    },
  ],

  async run($) {
    const message = await postMessage($);
    return message;
  },
});
