/**
 * Custom Data Service
 * Manages user-added custom tags and notes using Supabase
 * Falls back to localStorage if Supabase is not available
 */

import { STORAGE_KEYS, ERROR_MESSAGES } from '../utils/constants.js';
import * as SupabaseService from './supabase.js';

// Flag to track if we're using Supabase or localStorage
let useSupabase = false;

/**
 * Initialize the custom data service
 * @param {boolean} supabaseAvailable - Whether Supabase is available
 */
export function initCustomData(supabaseAvailable) {
  useSupabase = supabaseAvailable;
  console.log(`📊 Custom data service using: ${useSupabase ? 'Supabase' : 'localStorage'}`);
}

/**
 * Get custom tags for a repository
 * @param {number} repoId - GitHub repository ID
 * @returns {Promise<Array<string>>} Array of custom tags
 */
export async function getCustomTags(repoId) {
  if (useSupabase) {
    return await SupabaseService.getCustomTags(repoId);
  }

  // Fallback to localStorage
  try {
    const key = STORAGE_KEYS.CUSTOM_TAGS_PREFIX + repoId;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting custom tags:', error);
    return [];
  }
}

/**
 * Set custom tags for a repository
 * @param {number} repoId - GitHub repository ID
 * @param {Array<string>} tags - Array of custom tags
 * @returns {Promise<boolean>} Success status
 */
export async function setCustomTags(repoId, tags) {
  if (useSupabase) {
    return await SupabaseService.setCustomTags(repoId, tags);
  }

  // Fallback to localStorage
  try {
    const key = STORAGE_KEYS.CUSTOM_TAGS_PREFIX + repoId;
    localStorage.setItem(key, JSON.stringify(tags));
    return true;
  } catch (error) {
    console.error('Error setting custom tags:', error);
    if (error.name === 'QuotaExceededError') {
      showToast(ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED, 'error');
    }
    return false;
  }
}

/**
 * Get notes for a repository
 * @param {number} repoId - GitHub repository ID
 * @returns {Promise<string>} Notes text
 */
export async function getNotes(repoId) {
  if (useSupabase) {
    return await SupabaseService.getNotes(repoId);
  }

  // Fallback to localStorage
  try {
    const key = STORAGE_KEYS.NOTES_PREFIX + repoId;
    return localStorage.getItem(key) || '';
  } catch (error) {
    console.error('Error getting notes:', error);
    return '';
  }
}

/**
 * Set notes for a repository
 * @param {number} repoId - GitHub repository ID
 * @param {string} notes - Notes text
 * @returns {Promise<boolean>} Success status
 */
export async function setNotes(repoId, notes) {
  if (useSupabase) {
    return await SupabaseService.saveNotes(repoId, notes);
  }

  // Fallback to localStorage
  try {
    const key = STORAGE_KEYS.NOTES_PREFIX + repoId;
    if (notes.trim()) {
      localStorage.setItem(key, notes);
    } else {
      localStorage.removeItem(key);
    }
    return true;
  } catch (error) {
    console.error('Error setting notes:', error);
    if (error.name === 'QuotaExceededError') {
      showToast(ERROR_MESSAGES.STORAGE_QUOTA_EXCEEDED, 'error');
    }
    return false;
  }
}

/**
 * Merge custom data with repository data
 * @param {Object} repo - Repository object from GitHub
 * @returns {Promise<Object>} Repository with custom data merged in
 */
export async function mergeCustomData(repo) {
  const [custom_tags, notes] = await Promise.all([
    getCustomTags(repo.id),
    getNotes(repo.id)
  ]);

  return {
    ...repo,
    custom_tags,
    notes
  };
}

/**
 * Get all custom data (for export)
 * @returns {Object} All custom tags and notes
 */
export function getAllCustomData() {
  const customData = {
    tags: {},
    notes: {},
    exportedAt: new Date().toISOString()
  };

  // Iterate through localStorage
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith(STORAGE_KEYS.CUSTOM_TAGS_PREFIX)) {
      const repoId = key.replace(STORAGE_KEYS.CUSTOM_TAGS_PREFIX, '');
      customData.tags[repoId] = JSON.parse(localStorage.getItem(key));
    } else if (key.startsWith(STORAGE_KEYS.NOTES_PREFIX)) {
      const repoId = key.replace(STORAGE_KEYS.NOTES_PREFIX, '');
      customData.notes[repoId] = localStorage.getItem(key);
    }
  }

  return customData;
}

/**
 * Export all custom data as JSON file
 * @returns {Promise<boolean>} Success status
 */
export async function exportCustomData() {
  if (useSupabase) {
    return await SupabaseService.exportCustomData();
  }

  // Fallback to localStorage export
  try {
    const data = getAllCustomData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `github-stars-custom-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ Custom data exported successfully');
    return true;
  } catch (error) {
    console.error('Error exporting custom data:', error);
    return false;
  }
}

/**
 * Import custom data from JSON
 * @param {Object} data - Custom data object
 * @returns {boolean} Success status
 */
export function importCustomData(data) {
  try {
    if (!data.tags || !data.notes) {
      throw new Error('Invalid data format');
    }

    // Import tags
    Object.entries(data.tags).forEach(([repoId, tags]) => {
      setCustomTags(parseInt(repoId), tags);
    });

    // Import notes
    Object.entries(data.notes).forEach(([repoId, notes]) => {
      setNotes(parseInt(repoId), notes);
    });

    console.log('✅ Custom data imported successfully');
    return true;
  } catch (error) {
    console.error('Error importing custom data:', error);
    return false;
  }
}

/**
 * Clear all custom data (with confirmation)
 * @returns {boolean} Success status
 */
export function clearAllCustomData() {
  const keys = [];

  // Collect all custom data keys
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_KEYS.CUSTOM_TAGS_PREFIX) ||
        key.startsWith(STORAGE_KEYS.NOTES_PREFIX)) {
      keys.push(key);
    }
  }

  // Remove all custom data
  keys.forEach(key => localStorage.removeItem(key));

  console.log(`✅ Cleared ${keys.length} custom data items`);
  return true;
}

/**
 * Get all unique custom tags across all repositories
 * @returns {Promise<Array<string>>} Sorted array of unique custom tags
 */
export async function getAllUniqueTags() {
  if (useSupabase) {
    return await SupabaseService.getAllUniqueTags();
  }

  // Fallback to localStorage
  const tags = new Set();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith(STORAGE_KEYS.CUSTOM_TAGS_PREFIX)) {
      const repoTags = JSON.parse(localStorage.getItem(key));
      repoTags.forEach(tag => tags.add(tag));
    }
  }

  return Array.from(tags).sort();
}

// Helper function for toast notifications (will be defined in components.js)
function showToast(message, type = 'info') {
  // This will be imported from components.js when available
  console.log(`[${type.toUpperCase()}] ${message}`);
}
