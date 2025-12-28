/**
 * Storage Service
 * Handles loading and managing GitHub stars data from the JSON file
 */

import { CONFIG, ERROR_MESSAGES } from '../utils/constants.js';

/**
 * Load stars data from the JSON file
 * @returns {Promise<Object>} Stars data with metadata and repositories
 */
export async function loadStarsData() {
  try {
    const response = await fetch(CONFIG.DATA_FILE);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate data structure
    if (!data.metadata || !Array.isArray(data.repositories)) {
      throw new Error('Invalid data structure');
    }

    console.log(`✅ Loaded ${data.repositories.length} repositories`);
    return data;
  } catch (error) {
    console.error('Error loading stars data:', error);

    // Return empty structure on error
    return {
      metadata: {
        lastUpdated: null,
        username: CONFIG.USERNAME,
        totalStars: 0,
        version: '1.0'
      },
      repositories: []
    };
  }
}

/**
 * Parse a date string to a human-readable format
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export function formatDate(dateString) {
  if (!dateString) return 'Never';

  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Unknown';
  }
}

/**
 * Format a number to a compact string (e.g., 1.2k, 3.4M)
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

/**
 * Get unique languages from repositories
 * @param {Array} repositories - Array of repository objects
 * @returns {Array<string>} Sorted array of unique languages
 */
export function getUniqueLanguages(repositories) {
  const languages = new Set();

  repositories.forEach(repo => {
    if (repo.language && repo.language !== 'Unknown') {
      languages.add(repo.language);
    }
  });

  return Array.from(languages).sort();
}

/**
 * Get unique topics from repositories
 * @param {Array} repositories - Array of repository objects
 * @returns {Array<string>} Sorted array of unique topics
 */
export function getUniqueTopics(repositories) {
  const topics = new Set();

  repositories.forEach(repo => {
    if (Array.isArray(repo.topics)) {
      repo.topics.forEach(topic => topics.add(topic));
    }
  });

  return Array.from(topics).sort();
}
