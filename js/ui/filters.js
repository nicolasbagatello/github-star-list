/**
 * Filters and Search
 * Handles filtering, searching, and sorting of repositories
 */

import { CONFIG, SORT_OPTIONS } from '../utils/constants.js';
import { updateActiveFilters, setEmptyState } from './components.js';
import { renderRepositories } from './cards.js';

// Current filter state
let currentFilters = {
  search: '',
  language: '',
  topics: [],
  customTags: [],
  sort: SORT_OPTIONS.STARS_DESC
};

// All repositories (source of truth)
let allRepositories = [];

/**
 * Initialize filters
 * @param {Array} repositories - Array of all repositories
 */
export function initFilters(repositories) {
  allRepositories = repositories;

  setupSearchInput();
  setupLanguageFilter();
  setupSortSelect();
  setupFilterRemoval();
  setupTopicFiltering();
  setupCustomTagFiltering();

  // Initial render
  applyFilters();
}

/**
 * Setup search input with debouncing
 */
function setupSearchInput() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  let timeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      currentFilters.search = e.target.value.toLowerCase().trim();
      applyFilters();
    }, CONFIG.SEARCH_DEBOUNCE_MS);
  });
}

/**
 * Setup language filter dropdown
 */
function setupLanguageFilter() {
  const languageFilter = document.getElementById('language-filter');
  if (!languageFilter) return;

  // Populate language options
  const languages = new Set();
  allRepositories.forEach(repo => {
    if (repo.language && repo.language !== 'Unknown') {
      languages.add(repo.language);
    }
  });

  const sortedLanguages = Array.from(languages).sort();
  sortedLanguages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang;
    option.textContent = lang;
    languageFilter.appendChild(option);
  });

  // Handle selection
  languageFilter.addEventListener('change', (e) => {
    currentFilters.language = e.target.value;
    applyFilters();
  });
}

/**
 * Setup sort select dropdown
 */
function setupSortSelect() {
  const sortSelect = document.getElementById('sort-select');
  if (!sortSelect) return;

  sortSelect.addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    applyFilters();
  });
}

/**
 * Setup filter removal from chips
 */
function setupFilterRemoval() {
  window.addEventListener('removeFilter', (e) => {
    const { type, value } = e.detail;

    switch (type) {
      case 'search':
        currentFilters.search = '';
        const searchInput = document.getElementById('search-input');
        if (searchInput) searchInput.value = '';
        break;

      case 'language':
        currentFilters.language = '';
        const languageFilter = document.getElementById('language-filter');
        if (languageFilter) languageFilter.value = '';
        break;

      case 'topic':
        currentFilters.topics = currentFilters.topics.filter(t => t !== value);
        break;

      case 'customTag':
        currentFilters.customTags = currentFilters.customTags.filter(t => t !== value);
        break;
    }

    applyFilters();
  });
}

/**
 * Setup topic filtering from badge clicks
 */
function setupTopicFiltering() {
  window.addEventListener('filterByTopic', (e) => {
    const { topic } = e.detail;

    if (!currentFilters.topics.includes(topic)) {
      currentFilters.topics.push(topic);
      applyFilters();
    }
  });
}

/**
 * Setup custom tag filtering from badge clicks
 */
function setupCustomTagFiltering() {
  window.addEventListener('filterByCustomTag', (e) => {
    const { customTag } = e.detail;

    if (!currentFilters.customTags.includes(customTag)) {
      currentFilters.customTags.push(customTag);
      applyFilters();
    }
  });
}

/**
 * Apply all active filters and render results
 */
function applyFilters() {
  let filtered = [...allRepositories];

  // Apply search filter
  if (currentFilters.search) {
    filtered = filtered.filter(repo =>
      repo.name.toLowerCase().includes(currentFilters.search) ||
      repo.description.toLowerCase().includes(currentFilters.search) ||
      repo.full_name.toLowerCase().includes(currentFilters.search) ||
      repo.owner.login.toLowerCase().includes(currentFilters.search)
    );
  }

  // Apply language filter
  if (currentFilters.language) {
    filtered = filtered.filter(repo => repo.language === currentFilters.language);
  }

  // Apply topic filters
  if (currentFilters.topics.length > 0) {
    filtered = filtered.filter(repo =>
      currentFilters.topics.every(topic =>
        repo.topics && repo.topics.includes(topic)
      )
    );
  }

  // Apply custom tag filters
  if (currentFilters.customTags.length > 0) {
    filtered = filtered.filter(repo =>
      currentFilters.customTags.every(tag =>
        repo.custom_tags && repo.custom_tags.includes(tag)
      )
    );
  }

  // Apply sorting
  filtered = sortRepositories(filtered, currentFilters.sort);

  // Update UI
  updateActiveFilters(currentFilters);

  if (filtered.length === 0) {
    setEmptyState(true);
  } else {
    setEmptyState(false);
    renderRepositories(filtered);
  }

  console.log(`Filtered: ${filtered.length} / ${allRepositories.length} repositories`);
}

/**
 * Sort repositories based on sort option
 * @param {Array} repos - Repositories to sort
 * @param {string} sortOption - Sort option from SORT_OPTIONS
 * @returns {Array} Sorted repositories
 */
function sortRepositories(repos, sortOption) {
  const sorted = [...repos];

  switch (sortOption) {
    case SORT_OPTIONS.STARS_DESC:
      sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
      break;

    case SORT_OPTIONS.STARS_ASC:
      sorted.sort((a, b) => a.stargazers_count - b.stargazers_count);
      break;

    case SORT_OPTIONS.NAME_ASC:
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;

    case SORT_OPTIONS.NAME_DESC:
      sorted.sort((a, b) => b.name.localeCompare(a.name));
      break;

    case SORT_OPTIONS.UPDATED_DESC:
      sorted.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      break;

    case SORT_OPTIONS.UPDATED_ASC:
      sorted.sort((a, b) => new Date(a.updated_at) - new Date(b.updated_at));
      break;

    default:
      // Default to stars descending
      sorted.sort((a, b) => b.stargazers_count - a.stargazers_count);
  }

  return sorted;
}

/**
 * Update filters programmatically
 * @param {Object} filters - Filters to update
 */
export function updateFilters(filters) {
  currentFilters = { ...currentFilters, ...filters };
  applyFilters();
}

/**
 * Clear all filters
 */
export function clearFilters() {
  currentFilters = {
    search: '',
    language: '',
    topics: [],
    customTags: [],
    sort: SORT_OPTIONS.STARS_DESC
  };

  // Reset UI elements
  const searchInput = document.getElementById('search-input');
  const languageFilter = document.getElementById('language-filter');
  const sortSelect = document.getElementById('sort-select');

  if (searchInput) searchInput.value = '';
  if (languageFilter) languageFilter.value = '';
  if (sortSelect) sortSelect.value = SORT_OPTIONS.STARS_DESC;

  applyFilters();
}

/**
 * Get current filter state
 * @returns {Object} Current filters
 */
export function getFilters() {
  return { ...currentFilters };
}

/**
 * Initialize URL-based filters (for sharing filtered views)
 */
export function initURLFilters() {
  const params = new URLSearchParams(window.location.search);

  if (params.has('search')) {
    currentFilters.search = params.get('search');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = currentFilters.search;
  }

  if (params.has('language')) {
    currentFilters.language = params.get('language');
    const languageFilter = document.getElementById('language-filter');
    if (languageFilter) languageFilter.value = currentFilters.language;
  }

  if (params.has('topic')) {
    currentFilters.topics = params.get('topic').split(',');
  }

  if (params.has('sort')) {
    currentFilters.sort = params.get('sort');
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) sortSelect.value = currentFilters.sort;
  }
}

/**
 * Update URL with current filters (for sharing)
 */
export function updateURL() {
  const params = new URLSearchParams();

  if (currentFilters.search) params.set('search', currentFilters.search);
  if (currentFilters.language) params.set('language', currentFilters.language);
  if (currentFilters.topics.length > 0) params.set('topic', currentFilters.topics.join(','));
  if (currentFilters.sort && currentFilters.sort !== SORT_OPTIONS.STARS_DESC) {
    params.set('sort', currentFilters.sort);
  }

  const newURL = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname;

  window.history.replaceState({}, '', newURL);
}
