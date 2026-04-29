import defineAction from '#apps/helpers/define-action.js';

export default defineAction({
  name: 'Create Issue',
  key: 'createIssue',
  description: 'Creates a new issue in a GitHub repository.',
  arguments: [
    {
      label: 'Repository', key: 'repo', type: 'dropdown',
      required: true, variables: true,
      source: { type: 'query', name: 'getDynamicData',
        arguments: [{ name: 'key', value: 'listRepos' }] },
    },
    { label: 'Title', key: 'title', type: 'string', required: true, variables: true },
    { label: 'Body', key: 'body', type: 'string', required: false, variables: true },
  ],

  async run($) {
    const [owner, repo] = $.step.parameters.repo.split('/');
    const response = await $.http.post(`/repos/${owner}/${repo}/issues`, {
      title: $.step.parameters.title,
      body: $.step.parameters.body,
    });
    $.setActionItem({ raw: response.data });
  },
});
