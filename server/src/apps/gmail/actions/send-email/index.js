import defineAction from '#apps/helpers/define-action.js';

export default defineAction({
  name: 'Send email',
  key: 'sendEmail',
  description: 'Send a new email message.',
  arguments: [
    {
      label: 'To',
      key: 'to',
      type: 'string',
      required: true,
      variables: true,
      description: 'Email address of the recipient.',
    },
    {
      label: 'CC',
      key: 'cc',
      type: 'string',
      required: false,
      variables: true,
    },
    {
      label: 'BCC',
      key: 'bcc',
      type: 'string',
      required: false,
      variables: true,
    },
    {
      label: 'From',
      key: 'from',
      type: 'dropdown',
      required: false,
      description: 'Select an email address or alias from your Gmail Account. Defaults to the primary email address.',
      variables: true,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [{ name: 'key', value: 'listEmails' }],
      },
    },
    {
      label: 'From Name',
      key: 'fromName',
      type: 'string',
      required: false,
      variables: true,
    },
    {
      label: 'Reply To',
      key: 'replyTo',
      type: 'string',
      required: false,
      description: 'Specify a single reply address other than your own.',
      variables: true,
    },
    {
      label: 'Subject',
      key: 'subject',
      type: 'string',
      required: true,
      variables: true,
    },
    {
      label: 'Body Type',
      key: 'bodyType',
      type: 'dropdown',
      required: false,
      variables: true,
      options: [
        { label: 'plain', value: 'plain' },
        { label: 'html', value: 'html' },
      ],
    },
    {
      label: 'Body',
      key: 'emailBody',
      type: 'string',
      required: true,
      variables: true,
    },
    {
      label: 'Signature',
      key: 'signature',
      type: 'dropdown',
      required: false,
      variables: true,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [{ name: 'key', value: 'listSignatures' }],
      },
    },
  ],

  async run($) {
    const {
      to, cc, bcc, from, fromName, replyTo,
      subject, bodyType, emailBody, signature,
    } = $.step.parameters;

    const userId = 'me'; // Use 'me' instead of needing $.auth.data.userId

    const contentType = bodyType === 'html' ? 'text/html; charset="UTF-8"' : 'text/plain; charset="UTF-8"';

    const emailParts = [];
    if (from && fromName) emailParts.push(`From: ${fromName} <${from}>`);
    else if (from) emailParts.push(`From: ${from}`);

    if (replyTo) emailParts.push(`Reply-To: ${replyTo}`);
    emailParts.push(`To: ${to}`);
    if (cc) emailParts.push(`Cc: ${cc}`);
    if (bcc) emailParts.push(`Bcc: ${bcc}`);
    emailParts.push(`Subject: ${subject}`);
    emailParts.push(`Content-Type: ${contentType}`);
    emailParts.push('');
    emailParts.push(emailBody || '');
    if (signature) {
      emailParts.push('');
      emailParts.push(signature);
    }

    const emailStr = emailParts.join('\r\n');
    const base64EncodedEmailBody = Buffer.from(emailStr).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const body = { raw: base64EncodedEmailBody };

    const { data } = await $.http.post(`/gmail/v1/users/${userId}/messages/send`, body);

    $.setActionItem({ raw: data });
  },
});
