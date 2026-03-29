export const STATUS_OPTIONS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  NAME_ASC: 'name_asc',
  NAME_DESC: 'name_desc',
  MOST_RUNS: 'most_runs',
  LAST_RUN: 'last_run',
};

export function filterByStatus(workflows, status) {
  if (!workflows || status === STATUS_OPTIONS.ALL) return workflows;
  const isActive = status === STATUS_OPTIONS.ACTIVE;
  return workflows.filter((w) => w.active === isActive);
}

export function searchByName(workflows, query) {
  if (!workflows || !query?.trim()) return workflows;
  const normalizedQuery = query.trim().toLowerCase();
  return workflows.filter(
    (w) =>
      w.name?.toLowerCase().includes(normalizedQuery) ||
      w.description?.toLowerCase().includes(normalizedQuery)
  );
}

export function sortWorkflows(workflows, sortBy) {
  if (!workflows?.length) return workflows;

  const sorted = [...workflows];

  switch (sortBy) {
    case SORT_OPTIONS.NEWEST:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case SORT_OPTIONS.OLDEST:
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case SORT_OPTIONS.NAME_ASC:
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    case SORT_OPTIONS.NAME_DESC:
      return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
    case SORT_OPTIONS.MOST_RUNS:
      return sorted.sort((a, b) => (b.runCount || 0) - (a.runCount || 0));
    case SORT_OPTIONS.LAST_RUN:
      return sorted.sort((a, b) => {
        if (!a.lastRunAt) return 1;
        if (!b.lastRunAt) return -1;
        return new Date(b.lastRunAt) - new Date(a.lastRunAt);
      });
    default:
      return sorted;
  }
}


export function applyFilters(workflows, { search, status, sortBy } = {}) {
  let result = workflows;
  result = filterByStatus(result, status);
  result = searchByName(result, search);
  result = sortWorkflows(result, sortBy);
  return result;
}
