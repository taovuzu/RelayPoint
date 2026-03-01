import { nango } from '#util/nango.js';
import { logger } from '#util/logger.js';
import { ApiError } from '#util/ApiError.js';

export async function createIssue(connectionId, issueData) {
  const { repo, title, body } = issueData;

  if (!connectionId) {
    throw ApiError.badRequest('Connection ID is required for GitHub integration');
  }
  if (!repo) {
    throw ApiError.badRequest('GitHub repository (owner/repo) is required');
  }
  if (!title) {
    throw ApiError.badRequest('GitHub issue title is required');
  }
  if (!body) {
    throw ApiError.badRequest('GitHub issue body is required');
  }

  const [owner, repoName] = repo.split('/');
  if (!owner || !repoName) {
    throw ApiError.badRequest('Invalid repository format. Must be "owner/repo" (e.g., "facebook/react")');
  }

  try {
    logger.debug('Preparing to create GitHub issue via Nango Proxy', { connectionId, repo, title });

    const response = await nango.proxy({
      method: 'POST',
      endpoint: `/repos/${owner}/${repoName}/issues`,
      providerConfigKey: 'github',
      connectionId,
      retries: 3,
      data: { title, body }
    });

    logger.info('GitHub issue created successfully', {
      connectionId,
      repo,
      issueNumber: response.data.number,
      htmlUrl: response.data.html_url
    });

    return response.data;
  } catch (error) {
    const status = error.response?.status || 500;
    const errorMessage = error.response?.data?.message || error.message;

    logger.error('Failed to create GitHub issue', {
      connectionId,
      repo,
      status,
      error: errorMessage,
      nangoError: error.response?.data
    });

    if (status === 401) {
      throw ApiError.unauthorized('GitHub authentication expired or invalid. Please re-connect your account.');
    }

    if (status === 404) {
      throw ApiError.notFound(`GitHub repository "${repo}" not found or unauthorized access.`);
    }

    if (status === 410) {
      throw ApiError.badRequest(`GitHub repository "${repo}" has issues disabled.`);
    }

    if (status === 422) {
      throw ApiError.unprocessableEntity(`GitHub validation failed: ${errorMessage}`, error.response?.data?.errors);
    }

    throw new ApiError(
      status,
      `GitHub API error (${status}): ${errorMessage}`
    );
  }
}


// ref:  https://docs.github.com/en/rest/issues/issues#create-an-issue

