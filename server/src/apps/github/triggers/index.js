import newIssueEvent from '#apps/github/triggers/new-issue-event/index.js';
import newPushEvent from '#apps/github/triggers/new-push-event/index.js';

export default [newIssueEvent, newPushEvent];
