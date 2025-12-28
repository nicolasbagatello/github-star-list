/**
 * Repository Cards
 * Renders repository cards with custom tags and notes
 */

import { formatDate, formatNumber } from '../services/storage.js';
import { setCustomTags, setNotes, getAllUniqueTags } from '../services/customData.js';
import { createLanguageBadge, createBadge, sanitizeHTML, showToast } from './components.js';

/**
 * Create a repository card element
 * @param {Object} repo - Repository object with custom data merged
 * @returns {HTMLElement} Card element
 */
export function createRepoCard(repo) {
  const card = document.createElement('div');
  card.className = 'repo-card bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm';
  card.dataset.repoId = repo.id;

  const languageBadge = createLanguageBadge(repo.language);

  card.innerHTML = `
    <!-- Header -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3 flex-1 min-w-0">
        <img
          src="${repo.owner.avatar_url}"
          alt="${repo.owner.login}"
          class="w-10 h-10 rounded-full flex-shrink-0"
          loading="lazy"
        >
        <div class="min-w-0 flex-1">
          <a
            href="${repo.html_url}"
            target="_blank"
            rel="noopener noreferrer"
            class="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary transition-colors block truncate"
          >
            ${sanitizeHTML(repo.name)}
          </a>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            ${sanitizeHTML(repo.owner.login)}
          </p>
        </div>
      </div>
      <div class="flex items-center gap-1 text-gray-600 dark:text-gray-400 flex-shrink-0">
        <svg class="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        <span class="text-sm font-medium">${formatNumber(repo.stargazers_count)}</span>
      </div>
    </div>

    <!-- Description -->
    <p class="text-gray-700 dark:text-gray-300 text-sm mb-4 line-clamp-2">
      ${repo.description ? sanitizeHTML(repo.description) : '<em class="text-gray-400">No description</em>'}
    </p>

    <!-- Language -->
    <div class="mb-4">
      ${languageBadge ? languageBadge.outerHTML : ''}
    </div>

    <!-- GitHub Topics -->
    ${repo.topics && repo.topics.length > 0 ? `
      <div class="flex flex-wrap gap-2 mb-4" data-topics>
        ${repo.topics.slice(0, 5).map(topic =>
          `<span class="badge badge-topic" data-topic="${sanitizeHTML(topic)}">${sanitizeHTML(topic)}</span>`
        ).join('')}
        ${repo.topics.length > 5 ?
          `<span class="text-xs text-gray-500 dark:text-gray-400">+${repo.topics.length - 5} more</span>`
          : ''}
      </div>
    ` : ''}

    <!-- Custom Tags -->
    <div class="mb-4">
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
        </svg>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Custom Tags</span>
      </div>
      <div class="tag-input" data-tag-input>
        ${repo.custom_tags.map(tag =>
          `<span class="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md text-xs cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors" data-custom-tag="${sanitizeHTML(tag)}">
            <span class="pointer-events-none">${sanitizeHTML(tag)}</span>
            <button class="hover:text-indigo-900 dark:hover:text-indigo-100" data-remove-tag="${sanitizeHTML(tag)}" onclick="event.stopPropagation()">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </span>`
        ).join('')}
        <input
          type="text"
          placeholder="Add tag..."
          class="flex-1 min-w-[100px] bg-transparent border-none outline-none text-sm"
          data-tag-new-input
        >
      </div>
    </div>

    <!-- Notes -->
    <div>
      <div class="flex items-center gap-2 mb-2">
        <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
        </svg>
        <span class="text-xs font-medium text-gray-600 dark:text-gray-400">Notes</span>
      </div>
      <textarea
        class="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
        rows="2"
        placeholder="Add personal notes about this repository..."
        data-notes-input
      >${repo.notes ? sanitizeHTML(repo.notes) : ''}</textarea>
    </div>

    <!-- Footer Metadata -->
    <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
      <div class="flex items-center justify-between">
        <span>Updated ${formatDate(repo.updated_at)}</span>
        ${repo.starred_at ? `<span>Starred ${formatDate(repo.starred_at)}</span>` : ''}
      </div>
    </div>
  `;

  // Add event listeners
  setupCardEventListeners(card, repo);

  return card;
}

/**
 * Setup event listeners for a card
 * @param {HTMLElement} card - Card element
 * @param {Object} repo - Repository object
 */
function setupCardEventListeners(card, repo) {
  // Topic badges click to filter
  card.querySelectorAll('[data-topic]').forEach(badge => {
    badge.addEventListener('click', () => {
      const topic = badge.dataset.topic;
      window.dispatchEvent(new CustomEvent('filterByTopic', { detail: { topic } }));
    });
  });

  // Custom tags click to filter
  card.querySelectorAll('[data-custom-tag]').forEach(badge => {
    badge.addEventListener('click', () => {
      const customTag = badge.dataset.customTag;
      window.dispatchEvent(new CustomEvent('filterByCustomTag', { detail: { customTag } }));
    });
  });

  // Custom tags management
  const tagInput = card.querySelector('[data-tag-new-input]');
  const tagContainer = card.querySelector('[data-tag-input]');

  // Add tag on Enter
  tagInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && tagInput.value.trim()) {
      e.preventDefault();
      const newTag = tagInput.value.trim().toLowerCase();

      // Get current tags
      const currentTags = repo.custom_tags || [];

      // Check if tag already exists
      if (currentTags.includes(newTag)) {
        showToast('Tag already exists', 'warning', 2000);
        tagInput.value = '';
        return;
      }

      // Add new tag
      const updatedTags = [...currentTags, newTag];
      setCustomTags(repo.id, updatedTags);
      repo.custom_tags = updatedTags;

      // Create and add tag element
      const tagElement = createTagElement(newTag, () => {
        removeTag(repo, newTag, tagElement);
      });

      tagContainer.insertBefore(tagElement, tagInput);
      tagInput.value = '';

      showToast('Tag added', 'success', 1500);
    }
  });

  // Show autocomplete suggestions
  tagInput?.addEventListener('input', () => {
    showTagSuggestions(tagInput, repo);
  });

  // Remove tag buttons
  card.querySelectorAll('[data-remove-tag]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const tag = button.dataset.removeTag;
      removeTag(repo, tag, button.closest('span'));
    });
  });

  // Notes auto-save
  const notesInput = card.querySelector('[data-notes-input]');
  let notesTimeout;

  notesInput?.addEventListener('input', () => {
    clearTimeout(notesTimeout);
    notesTimeout = setTimeout(() => {
      setNotes(repo.id, notesInput.value);
      repo.notes = notesInput.value;
      showToast('Notes saved', 'success', 1500);
    }, 1000); // Debounce 1 second
  });
}

/**
 * Create a tag element
 * @param {string} tag - Tag text
 * @param {Function} onRemove - Remove handler
 * @returns {HTMLElement} Tag element
 */
function createTagElement(tag, onRemove) {
  const tagEl = document.createElement('span');
  tagEl.className = 'inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-md text-xs cursor-pointer hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors';
  tagEl.dataset.customTag = tag;
  tagEl.innerHTML = `
    <span class="pointer-events-none">${sanitizeHTML(tag)}</span>
    <button class="hover:text-indigo-900 dark:hover:text-indigo-100">
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  `;

  // Add click to filter
  tagEl.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('filterByCustomTag', { detail: { customTag: tag } }));
  });

  // Add remove button handler
  tagEl.querySelector('button')?.addEventListener('click', (e) => {
    e.stopPropagation();
    onRemove();
  });

  return tagEl;
}

/**
 * Remove a custom tag
 * @param {Object} repo - Repository object
 * @param {string} tag - Tag to remove
 * @param {HTMLElement} element - Tag element to remove from DOM
 */
function removeTag(repo, tag, element) {
  const updatedTags = repo.custom_tags.filter(t => t !== tag);
  setCustomTags(repo.id, updatedTags);
  repo.custom_tags = updatedTags;
  element.remove();
  showToast('Tag removed', 'success', 1500);
}

/**
 * Show tag suggestions (autocomplete)
 * @param {HTMLInputElement} input - Input element
 * @param {Object} repo - Repository object
 */
function showTagSuggestions(input, repo) {
  // Get all unique tags
  const allTags = getAllUniqueTags();
  const currentTags = repo.custom_tags || [];
  const inputValue = input.value.toLowerCase().trim();

  if (!inputValue) return;

  // Filter suggestions
  const suggestions = allTags
    .filter(tag =>
      tag.includes(inputValue) &&
      !currentTags.includes(tag)
    )
    .slice(0, 5);

  // For now, just log suggestions - can implement dropdown UI later
  if (suggestions.length > 0) {
    console.log('Suggestions:', suggestions);
  }
}

/**
 * Render repositories to the grid
 * @param {Array} repositories - Array of repository objects
 */
export function renderRepositories(repositories) {
  const container = document.getElementById('repos-container');
  if (!container) return;

  container.innerHTML = '';

  repositories.forEach(repo => {
    const card = createRepoCard(repo);
    container.appendChild(card);
  });

  // Update total count
  const totalStarsElement = document.getElementById('total-stars');
  if (totalStarsElement) {
    totalStarsElement.textContent = repositories.length;
  }
}
