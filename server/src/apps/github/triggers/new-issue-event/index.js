import defineTrigger from '#apps/helpers/define-trigger.js';
import * as Crypto from 'node:crypto';
import getRepoOwnerAndRepo from '#apps/github/common/get-repo-owner-and-repo.js';

export default defineTrigger({
  name: 'New issue event',
  key: 'newIssueEvent',
  type: 'webhook',
  description: 'Triggers on new issues in a repository',
  arguments: [
    {
      label: 'Repository',
      key: 'repo',
      type: 'dropdown',
      required: true,
      variables: false,
      source: {
        type: 'query',
        name: 'getDynamicData',
        arguments: [
          {
            name: 'key',
            value: 'listRepos',
          },
        ],
      },
    },
  ],

  async run($) {
    const webhookPayload = $.request.body;

    $.pushTriggerItem({
      raw: webhookPayload,
      meta: {
        internalId: Crypto.randomUUID(),
      },
    });
  },

  async testRun($) {
    const sampleData = {
      action: 'opened',
      issue: {
        number: 1,
        title: 'Sample Issue',
        body: 'This is a sample issue for testing.',
        state: 'open',
        user: {
          login: 'sampleuser',
          id: 1,
        },
      },
      repository: {
        name: 'repo',
        full_name: 'owner/repo',
        owner: {
          login: 'owner',
        },
      },
    };

    $.pushTriggerItem({
      raw: sampleData,
      meta: {
        internalId: Crypto.randomUUID(),
      },
    });
  },

  async registerHook($) {
    if ($.webhookUrl.includes('localhost')) {
      throw new Error('GitHub webhooks require a publicly accessible URL. Please use a tool like ngrok to expose your local server and update APP_URL in your .env file.');
    }

    const { repoOwner, repo } = getRepoOwnerAndRepo($.step.parameters.repo);

    const subscriptionPayload = {
      name: 'web',
      active: true,
      events: ['issues'],
      config: {
        url: $.webhookUrl,
        content_type: 'json',
        insecure_ssl: 0,
      },
    };

    const { data } = await $.http.post(
      `/repos/${repoOwner}/${repo}/hooks`,
      subscriptionPayload
    );

    await $.flow.setRemoteWebhookId(data.id.toString());
  },

  async unregisterHook($) {
    const { repoOwner, repo } = getRepoOwnerAndRepo($.step.parameters.repo);

    if ($.flow.remoteWebhookId) {
      await $.http.delete(
        `/repos/${repoOwner}/${repo}/hooks/${$.flow.remoteWebhookId}`
      );
    }
  },
});
