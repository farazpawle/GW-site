/**
 * localStorage utility functions for managing recent search history
 */

const RECENT_SEARCHES_KEY = 'garrit_wulf_recent_searches';
const MAX_RECENT_SEARCHES = 5;

/**
 * Save a search query to recent searches
 * Adds to the beginning of the array and limits to MAX_RECENT_SEARCHES
 */
export function saveRecentSearch(query: string): void {
  try {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    
    const existing = getRecentSearches();
    
    // Remove duplicates and add to front
    const updated = [trimmed, ...existing.filter(s => s !== trimmed)].slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
}

/**
 * Get all recent searches from localStorage
 * Returns empty array if none exist or on error
 */
export function getRecentSearches(): string[] {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored);
    
    // Validate that we got an array of strings
    if (!Array.isArray(parsed)) return [];
    
    return parsed.filter(item => typeof item === 'string' && item.trim().length > 0);
  } catch (error) {
    console.error('Failed to get recent searches:', error);
    return [];
  }
}

/**
 * Clear all recent searches from localStorage
 */
export function clearRecentSearches(): void {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
}

/**
 * Remove a specific search from recent searches
 */
export function removeRecentSearch(query: string): void {
  try {
    const existing = getRecentSearches();
    const updated = existing.filter(s => s !== query);
    
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to remove recent search:', error);
  }
}

/**
 * Check if localStorage is available
 * Useful for SSR/SSG contexts
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the maximum number of recent searches
 */
export function getMaxRecentSearches(): number {
  return MAX_RECENT_SEARCHES;
}
