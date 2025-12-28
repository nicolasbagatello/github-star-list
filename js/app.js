/**
 * GitHub Stars Manager - Main Application
 * Initializes and orchestrates all modules
 */

import { loadStarsData, formatDate } from './services/storage.js';
import { mergeCustomData, exportCustomData } from './services/customData.js';
import { initDarkMode, setLoadingState, showToast } from './ui/components.js';
import { initFilters, initURLFilters } from './ui/filters.js';

/**
 * Initialize the application
 */
async function init() {
  console.log('🚀 Initializing GitHub Stars Manager...');

  // Initialize dark mode
  initDarkMode();

  // Show loading state
  setLoadingState(true);

  try {
    // Load stars data from JSON file
    const data = await loadStarsData();

    // Merge custom data from localStorage
    const repositoriesWithCustomData = data.repositories.map(repo =>
      mergeCustomData(repo)
    );

    // Update UI with metadata
    updateMetadata(data.metadata);

    // Initialize URL-based filters (for sharing)
    initURLFilters();

    // Initialize filters and render repositories
    initFilters(repositoriesWithCustomData);

    // Hide loading state
    setLoadingState(false);

    // Setup additional event listeners
    setupEventListeners();

    console.log('✅ Application initialized successfully');

    // Show welcome message
    if (repositoriesWithCustomData.length > 0) {
      showToast(`Loaded ${repositoriesWithCustomData.length} starred repositories`, 'success');
    } else {
      showToast('No repositories found. Run the sync workflow to fetch your stars.', 'info', 5000);
    }
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    setLoadingState(false);
    showToast('Failed to load repository data. Please refresh the page.', 'error', 5000);
  }
}

/**
 * Update metadata in the UI
 * @param {Object} metadata - Metadata from stars.json
 */
function updateMetadata(metadata) {
  // Update username
  const usernameDisplay = document.getElementById('username-display');
  if (usernameDisplay && metadata.username) {
    usernameDisplay.textContent = `@${metadata.username}`;
  }

  // Update total stars (will be overridden by filter count)
  const totalStars = document.getElementById('total-stars');
  if (totalStars) {
    totalStars.textContent = metadata.totalStars || 0;
  }

  // Update last sync time
  const lastUpdated = document.getElementById('last-updated');
  if (lastUpdated) {
    lastUpdated.textContent = formatDate(metadata.lastUpdated);

    // Add tooltip with exact time
    if (metadata.lastUpdated) {
      const exactTime = new Date(metadata.lastUpdated).toLocaleString();
      lastUpdated.title = exactTime;
    }
  }
}

/**
 * Setup additional event listeners
 */
function setupEventListeners() {
  // Export custom data button
  const exportButton = document.getElementById('export-custom-data');
  exportButton?.addEventListener('click', () => {
    const success = exportCustomData();
    if (success) {
      showToast('Custom data exported successfully', 'success');
    } else {
      showToast('Failed to export custom data', 'error');
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      searchInput?.focus();
    }

    // Escape to clear search
    if (e.key === 'Escape') {
      const searchInput = document.getElementById('search-input');
      if (searchInput && document.activeElement === searchInput) {
        searchInput.value = '';
        searchInput.blur();
        window.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  });

  // Handle online/offline status
  window.addEventListener('online', () => {
    showToast('Back online', 'success', 2000);
  });

  window.addEventListener('offline', () => {
    showToast('You are offline. Showing cached data.', 'warning', 3000);
  });

  // Setup accessibility: skip to main content
  const skipLink = createSkipLink();
  document.body.insertBefore(skipLink, document.body.firstChild);
}

/**
 * Create a skip to main content link for accessibility
 * @returns {HTMLElement} Skip link element
 */
function createSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#repos-container';
  skipLink.textContent = 'Skip to repositories';
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg';

  // Add screen reader only utility if not exists
  if (!document.querySelector('style[data-sr-only]')) {
    const style = document.createElement('style');
    style.dataset.srOnly = '';
    style.textContent = `
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border-width: 0;
      }
      .focus\\:not-sr-only:focus {
        position: static;
        width: auto;
        height: auto;
        padding: 0.5rem 1rem;
        margin: 0;
        overflow: visible;
        clip: auto;
        white-space: normal;
      }
    `;
    document.head.appendChild(style);
  }

  return skipLink;
}

/**
 * Reload data (for future use when implementing refresh button)
 */
async function reloadData() {
  showToast('Reloading data...', 'info');
  await init();
}

// Make reload available globally for potential UI buttons
window.reloadStarsData = reloadData;

// Initialize application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Service Worker registration (for future PWA support)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Uncomment when service worker is implemented
    // navigator.serviceWorker.register('/sw.js')
    //   .then(reg => console.log('Service Worker registered'))
    //   .catch(err => console.log('Service Worker registration failed'));
  });
}

export { init, reloadData };
