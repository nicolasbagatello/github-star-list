/**
 * UI Components
 * Reusable UI elements like modals, toasts, badges, etc.
 */

import { STORAGE_KEYS } from '../utils/constants.js';

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white`;

  // Icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>';
      break;
    case 'error':
      icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>';
      break;
    case 'warning':
      icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>';
      break;
    default:
      icon = '<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>';
  }

  toast.innerHTML = `
    ${icon}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'toast-slide-out 200ms ease-in-out';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

/**
 * Create a badge element
 * @param {string} text - Badge text
 * @param {string} type - Badge type: 'primary', 'topic', 'language'
 * @param {Function} onClick - Optional click handler
 * @returns {HTMLElement} Badge element
 */
export function createBadge(text, type = 'primary', onClick = null) {
  const badge = document.createElement('span');
  badge.className = `badge badge-${type}`;
  badge.textContent = text;

  if (onClick) {
    badge.style.cursor = 'pointer';
    badge.addEventListener('click', onClick);
  }

  return badge;
}

/**
 * Create a language badge with color
 * @param {string} language - Programming language
 * @returns {HTMLElement} Language badge
 */
export function createLanguageBadge(language) {
  if (!language || language === 'Unknown') return null;

  const colors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    Go: '#00ADD8',
    Rust: '#dea584',
    Ruby: '#701516',
    PHP: '#4F5D95',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Swift: '#ffac45',
    Kotlin: '#A97BFF',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Shell: '#89e051',
    Vue: '#41b883',
    React: '#61dafb'
  };

  const color = colors[language] || '#6b7280';

  const badge = document.createElement('span');
  badge.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300';
  badge.innerHTML = `
    <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${color}"></span>
    ${language}
  `;

  return badge;
}

/**
 * Initialize dark mode toggle
 */
export function initDarkMode() {
  const toggle = document.getElementById('dark-mode-toggle');
  const html = document.documentElement;

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem(STORAGE_KEYS.DARK_MODE);
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemDark)) {
    html.classList.add('dark');
  }

  // Toggle on click
  toggle?.addEventListener('click', () => {
    html.classList.toggle('dark');
    const isDark = html.classList.contains('dark');
    localStorage.setItem(STORAGE_KEYS.DARK_MODE, isDark ? 'dark' : 'light');
  });
}

/**
 * Create a skeleton loading card
 * @returns {HTMLElement} Skeleton card element
 */
export function createSkeletonCard() {
  const card = document.createElement('div');
  card.className = 'bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700';
  card.innerHTML = `
    <div class="skeleton h-6 w-3/4 mb-4 rounded"></div>
    <div class="skeleton h-4 w-full mb-2 rounded"></div>
    <div class="skeleton h-4 w-5/6 mb-4 rounded"></div>
    <div class="flex gap-2 mb-4">
      <div class="skeleton h-6 w-16 rounded-full"></div>
      <div class="skeleton h-6 w-16 rounded-full"></div>
      <div class="skeleton h-6 w-16 rounded-full"></div>
    </div>
    <div class="skeleton h-10 w-full rounded"></div>
  `;
  return card;
}

/**
 * Show loading state
 * @param {boolean} show - Whether to show loading state
 */
export function setLoadingState(show) {
  const loadingElement = document.getElementById('loading-state');
  const reposContainer = document.getElementById('repos-container');
  const emptyState = document.getElementById('empty-state');

  if (show) {
    loadingElement?.classList.remove('hidden');
    reposContainer?.classList.add('hidden');
    emptyState?.classList.add('hidden');
  } else {
    loadingElement?.classList.add('hidden');
    reposContainer?.classList.remove('hidden');
  }
}

/**
 * Show/hide empty state
 * @param {boolean} show - Whether to show empty state
 */
export function setEmptyState(show) {
  const emptyState = document.getElementById('empty-state');
  const reposContainer = document.getElementById('repos-container');

  if (show) {
    emptyState?.classList.remove('hidden');
    reposContainer?.classList.add('hidden');
  } else {
    emptyState?.classList.add('hidden');
    reposContainer?.classList.remove('hidden');
  }
}

/**
 * Create a filter chip
 * @param {string} label - Filter label
 * @param {Function} onRemove - Remove handler
 * @returns {HTMLElement} Filter chip element
 */
export function createFilterChip(label, onRemove) {
  const chip = document.createElement('div');
  chip.className = 'filter-chip';
  chip.innerHTML = `
    <span>${label}</span>
    <button aria-label="Remove filter">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  `;

  chip.querySelector('button')?.addEventListener('click', onRemove);

  return chip;
}

/**
 * Update active filters display
 * @param {Object} filters - Active filters object
 */
export function updateActiveFilters(filters) {
  const container = document.getElementById('active-filters');
  const chipsContainer = document.getElementById('filter-chips');

  if (!container || !chipsContainer) return;

  chipsContainer.innerHTML = '';

  const activeFilters = [];

  if (filters.search) {
    activeFilters.push({
      label: `Search: "${filters.search}"`,
      type: 'search'
    });
  }

  if (filters.language) {
    activeFilters.push({
      label: `Language: ${filters.language}`,
      type: 'language'
    });
  }

  if (filters.topics && filters.topics.length > 0) {
    filters.topics.forEach(topic => {
      activeFilters.push({
        label: `Topic: ${topic}`,
        type: 'topic',
        value: topic
      });
    });
  }

  if (activeFilters.length > 0) {
    container.classList.remove('hidden');
    activeFilters.forEach(filter => {
      const chip = createFilterChip(filter.label, () => {
        // Dispatch custom event to remove filter
        window.dispatchEvent(new CustomEvent('removeFilter', {
          detail: { type: filter.type, value: filter.value }
        }));
      });
      chipsContainer.appendChild(chip);
    });
  } else {
    container.classList.add('hidden');
  }
}

/**
 * Sanitize HTML to prevent XSS
 * @param {string} html - HTML string
 * @returns {string} Sanitized HTML
 */
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}
