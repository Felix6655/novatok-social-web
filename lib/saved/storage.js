// Storage layer for Saved feature
// Uses localStorage for persistence (Supabase table not yet created)

const STORAGE_KEY = 'novatok_saved_items'

/**
 * Generate a unique save ID
 */
function generateSaveId() {
  return `save_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all saved items from storage
 * @returns {Array} Array of saved items
 */
export function getSavedItems() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get saved items filtered by type
 * @param {string} type - Filter by type (think, tarot, horoscope, memory)
 * @returns {Array} Filtered saved items
 */
export function getSavedItemsByType(type) {
  return getSavedItems().filter(item => item.type === type)
}

/**
 * Check if an item is saved
 * @param {string} type - Item type
 * @param {string} sourceId - Original item ID
 * @returns {boolean}
 */
export function isSaved(type, sourceId) {
  const saved = getSavedItems()
  return saved.some(item => item.type === type && item.sourceId === sourceId)
}

/**
 * Save an item
 * @param {Object} item - Item to save
 * @param {string} item.type - Type (think, tarot, horoscope, memory)
 * @param {string} item.sourceId - Original item ID
 * @param {string} item.title - Display title
 * @param {string} item.summary - Short summary
 * @param {Object} item.metadata - Optional metadata
 * @param {string} item.createdAt - Original creation date
 * @returns {Object} Saved item with id and savedAt
 */
export function saveItem(item) {
  if (typeof window === 'undefined') return null
  
  const saved = getSavedItems()
  
  // Check if already saved
  const exists = saved.find(s => s.type === item.type && s.sourceId === item.sourceId)
  if (exists) return exists
  
  const newSave = {
    id: generateSaveId(),
    type: item.type,
    sourceId: item.sourceId,
    title: item.title,
    summary: item.summary,
    metadata: item.metadata || {},
    createdAt: item.createdAt,
    savedAt: new Date().toISOString()
  }
  
  saved.unshift(newSave)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  
  return newSave
}

/**
 * Remove an item from saved
 * @param {string} type - Item type
 * @param {string} sourceId - Original item ID
 * @returns {boolean} Success
 */
export function unsaveItem(type, sourceId) {
  if (typeof window === 'undefined') return false
  
  const saved = getSavedItems()
  const filtered = saved.filter(item => !(item.type === type && item.sourceId === sourceId))
  
  if (filtered.length === saved.length) return false // Nothing removed
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

/**
 * Toggle saved state for an item
 * @param {Object} item - Item to toggle
 * @returns {{ saved: boolean, item: Object|null }} Result
 */
export function toggleSaved(item) {
  const currentlySaved = isSaved(item.type, item.sourceId)
  
  if (currentlySaved) {
    unsaveItem(item.type, item.sourceId)
    return { saved: false, item: null }
  } else {
    const savedItem = saveItem(item)
    return { saved: true, item: savedItem }
  }
}

/**
 * Get count of saved items
 * @returns {number}
 */
export function getSavedCount() {
  return getSavedItems().length
}

/**
 * Get count of saved items by type
 * @param {string} type
 * @returns {number}
 */
export function getSavedCountByType(type) {
  return getSavedItemsByType(type).length
}

/**
 * Clear all saved items (for testing)
 */
export function clearAllSaved() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}
