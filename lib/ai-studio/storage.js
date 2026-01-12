/**
 * AI Studio Storage Layer
 * 
 * Manages generation history in localStorage (client-side)
 * Structure mirrors what will eventually move to a database
 */

const STORAGE_KEY = 'novatok_ai_studio_history'
const MAX_HISTORY = 50

/**
 * @typedef {Object} GenerationRecord
 * @property {string} id - Unique generation ID
 * @property {'image' | 'video'} type - Type of generation
 * @property {string} prompt - Original prompt
 * @property {string} enhancedPrompt - Prompt with style applied
 * @property {string} style - Style preset used
 * @property {string} size - Size preset used
 * @property {string} resultUrl - URL of generated content
 * @property {string} model - Model used
 * @property {string} status - 'completed' | 'failed' | 'pending'
 * @property {string} createdAt - ISO timestamp
 * @property {Object} [metadata] - Additional metadata
 */

/**
 * Generate a unique ID for a generation
 */
export function generateId() {
  return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all generation history
 * @returns {GenerationRecord[]}
 */
export function getHistory() {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('[AI Studio] Failed to load history:', error)
    return []
  }
}

/**
 * Save a generation record to history
 * @param {GenerationRecord} record
 */
export function saveGeneration(record) {
  if (typeof window === 'undefined') return
  
  try {
    const history = getHistory()
    
    // Add new record at the beginning
    history.unshift({
      ...record,
      id: record.id || generateId(),
      createdAt: record.createdAt || new Date().toISOString(),
    })
    
    // Trim to max history size
    if (history.length > MAX_HISTORY) {
      history.splice(MAX_HISTORY)
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (error) {
    console.error('[AI Studio] Failed to save generation:', error)
  }
}

/**
 * Get a single generation by ID
 * @param {string} id
 * @returns {GenerationRecord | null}
 */
export function getGeneration(id) {
  const history = getHistory()
  return history.find(item => item.id === id) || null
}

/**
 * Delete a generation from history
 * @param {string} id
 */
export function deleteGeneration(id) {
  if (typeof window === 'undefined') return
  
  try {
    const history = getHistory()
    const filtered = history.filter(item => item.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('[AI Studio] Failed to delete generation:', error)
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('[AI Studio] Failed to clear history:', error)
  }
}

/**
 * Get history filtered by type
 * @param {'image' | 'video'} type
 * @returns {GenerationRecord[]}
 */
export function getHistoryByType(type) {
  return getHistory().filter(item => item.type === type)
}

/**
 * Style preset definitions (mirrored from API for client reference)
 */
export const STYLE_PRESETS = [
  { id: 'none', name: 'None', description: 'Use prompt as-is' },
  { id: 'photorealistic', name: 'Photorealistic', description: 'Ultra-realistic photography' },
  { id: 'anime', name: 'Anime', description: 'Japanese animation style' },
  { id: 'digital_art', name: 'Digital Art', description: 'Modern digital illustration' },
  { id: 'oil_painting', name: 'Oil Painting', description: 'Classical art style' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft, flowing colors' },
  { id: '3d_render', name: '3D Render', description: 'CGI and 3D graphics' },
  { id: 'cinematic', name: 'Cinematic', description: 'Movie still aesthetic' },
  { id: 'neon', name: 'Neon/Cyberpunk', description: 'Glowing neon colors' },
]

/**
 * Size preset definitions
 */
export const SIZE_PRESETS = [
  { id: 'square', name: 'Square', ratio: '1:1', description: '1024×1024' },
  { id: 'portrait', name: 'Portrait', ratio: '3:4', description: '768×1024' },
  { id: 'landscape', name: 'Landscape', ratio: '4:3', description: '1024×768' },
  { id: 'wide', name: 'Widescreen', ratio: '16:9', description: '1280×720' },
]
