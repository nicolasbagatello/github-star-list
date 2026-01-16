/**
 * GitHub Stars Manager - Main Application
 * Initializes and orchestrates all modules
 */

import { loadStarsData, formatDate } from './services/storage.js';
import { mergeCustomData, exportCustomData, initCustomData, getAllCustomData } from './services/customData.js';
import { initSupabase, migrateFromLocalStorage } from './services/supabase.js';
import { initDarkMode, setLoadingState, showToast } from './ui/components.js';
import { initFilters, initURLFilters } from './ui/filters.js';
import { FEATURES, STORAGE_KEYS, CONFIG } from './utils/constants.js';

// Sync state
let syncCooldownInterval = null;
let lastMetadata = null;

/**
 * Initialize the application
 */
async function init() {
  console.log('🚀 Initializing GitHub Stars Manager...');

  // Initialize dark mode
  initDarkMode();

  // Initialize Supabase (only if feature flag enabled)
  const supabaseAvailable = FEATURES.USE_SUPABASE ? initSupabase() : false;
  initCustomData(supabaseAvailable);

  // Show loading state
  setLoadingState(true);

  try {
    // Load stars data from JSON file
    const data = await loadStarsData();

    // Merge custom data from Supabase/localStorage (async now)
    const repositoriesWithCustomData = await Promise.all(
      data.repositories.map(repo => mergeCustomData(repo))
    );

    // Store metadata for sync functionality
    lastMetadata = data.metadata;

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

    // Initialize sync button state and start cooldown timer if needed
    updateSyncButtonState();
    startCooldownTimer();

    // Check if data is stale and auto-sync if needed
    checkStalenessAndSync();

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
  // Sync button
  const syncButton = document.getElementById('sync-button');
  syncButton?.addEventListener('click', () => {
    syncData();
  });

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

  // Migrate to Supabase button (only show if Supabase is enabled)
  const migrateButton = document.getElementById('migrate-to-supabase');
  if (migrateButton) {
    if (!FEATURES.USE_SUPABASE) {
      migrateButton.style.display = 'none';
    } else {
      migrateButton.addEventListener('click', async () => {
        if (!confirm('This will migrate your custom tags and notes from localStorage to Supabase. Continue?')) {
          return;
        }

        showToast('Starting migration...', 'info');

        try {
          const localData = getAllCustomData();
          const results = await migrateFromLocalStorage(localData);

          if (results.errors.length > 0) {
            console.error('Migration errors:', results.errors);
            showToast(`Migration completed with ${results.errors.length} errors. Check console for details.`, 'warning', 5000);
          } else {
            showToast(`Migration successful! Imported ${results.tagsImported} tags and ${results.notesImported} notes.`, 'success', 5000);
          }
        } catch (error) {
          console.error('Migration failed:', error);
          showToast('Migration failed. Please try again.', 'error', 5000);
        }
      });
    }
  }

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
 * Check if sync is allowed (cooldown has elapsed)
 * @returns {boolean} True if sync is allowed
 */
function canSync() {
  const lastSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
  if (!lastSyncTime) return true;

  const elapsed = Date.now() - parseInt(lastSyncTime, 10);
  return elapsed >= CONFIG.SYNC_COOLDOWN_MS;
}

/**
 * Get remaining cooldown time in seconds
 * @returns {number} Remaining seconds, 0 if cooldown has elapsed
 */
function getCooldownRemaining() {
  const lastSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
  if (!lastSyncTime) return 0;

  const elapsed = Date.now() - parseInt(lastSyncTime, 10);
  const remaining = CONFIG.SYNC_COOLDOWN_MS - elapsed;
  return remaining > 0 ? Math.ceil(remaining / 1000) : 0;
}

/**
 * Format cooldown remaining time for display
 * @param {number} seconds - Remaining seconds
 * @returns {string} Formatted time string
 */
function formatCooldownTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m`;
  }
  return `${secs}s`;
}

/**
 * Update sync button UI state
 */
function updateSyncButtonState() {
  const syncButton = document.getElementById('sync-button');
  const syncButtonText = document.getElementById('sync-button-text');
  if (!syncButton || !syncButtonText) return;

  const cooldownRemaining = getCooldownRemaining();

  if (cooldownRemaining > 0) {
    syncButton.disabled = true;
    syncButtonText.textContent = `Sync (${formatCooldownTime(cooldownRemaining)})`;
  } else {
    syncButton.disabled = false;
    syncButtonText.textContent = 'Sync';
  }
}

/**
 * Set sync button loading state
 * @param {boolean} loading - Whether loading is in progress
 */
function setSyncButtonLoading(loading) {
  const syncButton = document.getElementById('sync-button');
  const syncButtonText = document.getElementById('sync-button-text');
  if (!syncButton || !syncButtonText) return;

  if (loading) {
    syncButton.disabled = true;
    syncButtonText.textContent = 'Syncing...';
    syncButton.classList.add('animate-pulse');
  } else {
    syncButton.classList.remove('animate-pulse');
    updateSyncButtonState();
  }
}

/**
 * Start or restart the cooldown timer to update button state
 */
function startCooldownTimer() {
  // Clear existing interval
  if (syncCooldownInterval) {
    clearInterval(syncCooldownInterval);
    syncCooldownInterval = null;
  }

  const cooldownRemaining = getCooldownRemaining();
  if (cooldownRemaining <= 0) return;

  // Update every 30 seconds
  syncCooldownInterval = setInterval(() => {
    updateSyncButtonState();

    // Stop interval when cooldown expires
    if (getCooldownRemaining() <= 0) {
      clearInterval(syncCooldownInterval);
      syncCooldownInterval = null;
    }
  }, 30000);
}

/**
 * Perform sync with cooldown enforcement
 * @param {boolean} force - Force sync even if cooldown hasn't elapsed (for internal use)
 * @param {boolean} silent - Don't show toast messages (for auto-sync)
 */
async function syncData(force = false, silent = false) {
  // Check cooldown
  if (!force && !canSync()) {
    const remaining = getCooldownRemaining();
    showToast(`Please wait ${formatCooldownTime(remaining)} before syncing again.`, 'warning', 3000);
    return;
  }

  // Set loading state
  setSyncButtonLoading(true);

  if (!silent) {
    showToast('Syncing data...', 'info', 2000);
  }

  try {
    // Record sync time before reloading to prevent race conditions
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, Date.now().toString());

    // Reload data (re-fetch stars.json)
    await reloadData();

    // Start cooldown timer
    startCooldownTimer();

    if (!silent) {
      showToast('Sync completed successfully', 'success');
    }
  } catch (error) {
    console.error('Sync failed:', error);
    showToast('Sync failed. Please try again.', 'error', 3000);
  } finally {
    setSyncButtonLoading(false);
  }
}

/**
 * Check if data is stale and auto-sync on page load
 */
function checkStalenessAndSync() {
  if (!lastMetadata || !lastMetadata.lastUpdated) return;

  const dataAge = Date.now() - new Date(lastMetadata.lastUpdated).getTime();
  const isStale = dataAge >= CONFIG.STALENESS_THRESHOLD_MS;

  if (isStale && canSync()) {
    console.log('📊 Data is stale, auto-syncing...');
    showToast('Data was stale, syncing...', 'info', 2000);
    // Use silent mode for auto-sync to avoid duplicate success toasts
    syncData(true, true);
  }
}

/**
 * Reload data (for future use when implementing refresh button)
 */
async function reloadData() {
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

export { init, reloadData, syncData };
