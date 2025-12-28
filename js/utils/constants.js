// API Configuration
export const API_BASE = 'https://api.github.com';

export const ENDPOINTS = {
  USER_STARRED: (username) => `${API_BASE}/users/${username}/starred`,
  WORKFLOW_DISPATCH: (owner, repo, workflow) =>
    `${API_BASE}/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`
};

// Storage Keys
export const STORAGE_KEYS = {
  CUSTOM_TAGS_PREFIX: 'custom_tags_',
  NOTES_PREFIX: 'notes_',
  PREFERENCES: 'user_preferences',
  WORKFLOW_TOKEN: 'workflow_token',
  DARK_MODE: 'dark_mode'
};

// Configuration
export const CONFIG = {
  REPO_OWNER: 'nicolasbagatello',
  REPO_NAME: 'github-star-list',
  USERNAME: 'nicolasbagatello',
  DATA_FILE: './data/stars.json',
  ITEMS_PER_PAGE: 100,
  SEARCH_DEBOUNCE_MS: 300
};

// UI Constants
export const SORT_OPTIONS = {
  STARS_DESC: 'stars-desc',
  STARS_ASC: 'stars-asc',
  NAME_ASC: 'name-asc',
  NAME_DESC: 'name-desc',
  UPDATED_DESC: 'updated-desc',
  UPDATED_ASC: 'updated-asc'
};

// Error Messages
export const ERROR_MESSAGES = {
  LOAD_DATA_FAILED: 'Failed to load repository data. Please try again later.',
  NETWORK_ERROR: 'Network error occurred. Showing cached data.',
  WORKFLOW_TRIGGER_FAILED: 'Failed to trigger sync workflow. Please try again.',
  STORAGE_QUOTA_EXCEEDED: 'Local storage quota exceeded. Please export and clear old data.'
};
