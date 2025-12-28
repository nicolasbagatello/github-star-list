// API Configuration
export const API_BASE = 'https://api.github.com';

export const ENDPOINTS = {
  USER_STARRED: (username) => `${API_BASE}/users/${username}/starred`,
  WORKFLOW_DISPATCH: (owner, repo, workflow) =>
    `${API_BASE}/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`
};

// Feature Flags
export const FEATURES = {
  // Set to true to enable Supabase for cross-device sync (requires setup)
  // Note: Supabase database is publicly writable - anyone can add/edit data
  // For private use, keep this false (uses localStorage only)
  USE_SUPABASE: false
};

// Supabase Configuration
// Only used if FEATURES.USE_SUPABASE is true
export const SUPABASE_URL = 'https://quhkbwfxighmvtkdgpjv.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1aGtid2Z4aWdobXZ0a2RncGp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTc0MTksImV4cCI6MjA4MjUzMzQxOX0.p22HVFw-VTW0t9g_x6cgTuXOElMXNlkJggMf6INyjUU';

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
