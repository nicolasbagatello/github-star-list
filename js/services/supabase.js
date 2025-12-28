/**
 * Supabase Service
 * Handles all database operations for custom tags and notes
 */

import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants.js';

// Initialize Supabase client (will be set after library loads)
let supabase = null;

/**
 * Initialize Supabase client
 * Must be called after the Supabase library is loaded
 */
export function initSupabase() {
  if (typeof window.supabase === 'undefined') {
    console.error('Supabase library not loaded');
    return false;
  }

  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase initialized');
  return true;
}

/**
 * Get custom tags for a repository
 * @param {number} repoId - GitHub repository ID
 * @returns {Promise<Array<string>>} Array of tags
 */
export async function getCustomTags(repoId) {
  try {
    const { data, error } = await supabase
      .from('custom_tags')
      .select('tag')
      .eq('repo_id', repoId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return data?.map(row => row.tag) || [];
  } catch (error) {
    console.error('Error getting custom tags:', error);
    return [];
  }
}

/**
 * Add a custom tag to a repository
 * @param {number} repoId - GitHub repository ID
 * @param {string} tag - Tag to add
 * @returns {Promise<boolean>} Success status
 */
export async function addCustomTag(repoId, tag) {
  try {
    const { error } = await supabase
      .from('custom_tags')
      .insert({
        repo_id: repoId,
        tag: tag.toLowerCase().trim()
      });

    if (error) {
      // Ignore duplicate key errors (tag already exists)
      if (error.code === '23505') {
        return true;
      }
      throw error;
    }

    console.log(`✅ Tag "${tag}" added to repo ${repoId}`);
    return true;
  } catch (error) {
    console.error('Error adding custom tag:', error);
    return false;
  }
}

/**
 * Remove a custom tag from a repository
 * @param {number} repoId - GitHub repository ID
 * @param {string} tag - Tag to remove
 * @returns {Promise<boolean>} Success status
 */
export async function removeCustomTag(repoId, tag) {
  try {
    const { error } = await supabase
      .from('custom_tags')
      .delete()
      .eq('repo_id', repoId)
      .eq('tag', tag);

    if (error) throw error;

    console.log(`✅ Tag "${tag}" removed from repo ${repoId}`);
    return true;
  } catch (error) {
    console.error('Error removing custom tag:', error);
    return false;
  }
}

/**
 * Set all custom tags for a repository (replaces existing tags)
 * @param {number} repoId - GitHub repository ID
 * @param {Array<string>} tags - Array of tags
 * @returns {Promise<boolean>} Success status
 */
export async function setCustomTags(repoId, tags) {
  try {
    // Delete existing tags
    await supabase
      .from('custom_tags')
      .delete()
      .eq('repo_id', repoId);

    // Insert new tags
    if (tags.length > 0) {
      const rows = tags.map(tag => ({
        repo_id: repoId,
        tag: tag.toLowerCase().trim()
      }));

      const { error } = await supabase
        .from('custom_tags')
        .insert(rows);

      if (error) throw error;
    }

    console.log(`✅ Tags updated for repo ${repoId}`);
    return true;
  } catch (error) {
    console.error('Error setting custom tags:', error);
    return false;
  }
}

/**
 * Get notes for a repository
 * @param {number} repoId - GitHub repository ID
 * @returns {Promise<string>} Notes content
 */
export async function getNotes(repoId) {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('content')
      .eq('repo_id', repoId)
      .single();

    if (error) {
      // Not found is okay, just return empty string
      if (error.code === 'PGRST116') {
        return '';
      }
      throw error;
    }

    return data?.content || '';
  } catch (error) {
    console.error('Error getting notes:', error);
    return '';
  }
}

/**
 * Save notes for a repository
 * @param {number} repoId - GitHub repository ID
 * @param {string} content - Notes content
 * @returns {Promise<boolean>} Success status
 */
export async function saveNotes(repoId, content) {
  try {
    const trimmedContent = content.trim();

    if (trimmedContent === '') {
      // Delete notes if empty
      await supabase
        .from('notes')
        .delete()
        .eq('repo_id', repoId);
    } else {
      // Upsert (insert or update)
      const { error } = await supabase
        .from('notes')
        .upsert({
          repo_id: repoId,
          content: trimmedContent,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    }

    console.log(`✅ Notes saved for repo ${repoId}`);
    return true;
  } catch (error) {
    console.error('Error saving notes:', error);
    return false;
  }
}

/**
 * Get all unique custom tags across all repositories
 * @returns {Promise<Array<string>>} Array of unique tags
 */
export async function getAllUniqueTags() {
  try {
    const { data, error } = await supabase
      .from('custom_tags')
      .select('tag')
      .order('tag');

    if (error) throw error;

    // Get unique tags
    const uniqueTags = [...new Set(data?.map(row => row.tag) || [])];
    return uniqueTags;
  } catch (error) {
    console.error('Error getting unique tags:', error);
    return [];
  }
}

/**
 * Get all custom data for export
 * @returns {Promise<Object>} All custom tags and notes
 */
export async function getAllCustomData() {
  try {
    const [tagsResult, notesResult] = await Promise.all([
      supabase.from('custom_tags').select('*'),
      supabase.from('notes').select('*')
    ]);

    return {
      tags: tagsResult.data || [],
      notes: notesResult.data || [],
      exportedAt: new Date().toISOString(),
      source: 'supabase'
    };
  } catch (error) {
    console.error('Error getting all custom data:', error);
    return {
      tags: [],
      notes: [],
      exportedAt: new Date().toISOString(),
      source: 'supabase',
      error: error.message
    };
  }
}

/**
 * Export all custom data as JSON file
 * @returns {Promise<boolean>} Success status
 */
export async function exportCustomData() {
  try {
    const data = await getAllCustomData();
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
 * Import custom data from localStorage (migration helper)
 * @param {Object} localStorageData - Data from localStorage
 * @returns {Promise<Object>} Migration results
 */
export async function migrateFromLocalStorage(localStorageData) {
  const results = {
    tagsImported: 0,
    notesImported: 0,
    errors: []
  };

  try {
    // Import tags
    for (const [key, value] of Object.entries(localStorageData.tags || {})) {
      try {
        const repoId = parseInt(key);
        const tags = JSON.parse(value);

        if (Array.isArray(tags) && tags.length > 0) {
          await setCustomTags(repoId, tags);
          results.tagsImported += tags.length;
        }
      } catch (error) {
        results.errors.push(`Failed to import tags for ${key}: ${error.message}`);
      }
    }

    // Import notes
    for (const [key, content] of Object.entries(localStorageData.notes || {})) {
      try {
        const repoId = parseInt(key);

        if (content && content.trim()) {
          await saveNotes(repoId, content);
          results.notesImported++;
        }
      } catch (error) {
        results.errors.push(`Failed to import notes for ${key}: ${error.message}`);
      }
    }

    console.log('✅ Migration complete:', results);
    return results;
  } catch (error) {
    console.error('Error during migration:', error);
    results.errors.push(`Migration failed: ${error.message}`);
    return results;
  }
}
