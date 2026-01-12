/**
 * AI Studio Storage Layer
 * 
 * Manages generation history using cross-platform storage adapter.
 * Works on both web (localStorage) and native (AsyncStorage).
 */

import storage from '@/src/services/storage'

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
 * @returns {Promise<GenerationRecord[]>}
 */
export async function getHistory() {
  const history = await storage.getItem(STORAGE_KEY, [])
  return Array.isArray(history) ? history : []
}

/**
 * Get history synchronously (for initial render, returns empty if not loaded)
 * Use getHistory() for the actual data after mount
 * @returns {GenerationRecord[]}
 */
export function getHistorySync() {
  // This is a sync wrapper for SSR/initial render
  // Returns empty array - actual data should be loaded via getHistory()
  return []
}

/**
 * Save a generation record to history
 * @param {GenerationRecord} record
 * @returns {Promise<void>}
 */
export async function saveGeneration(record) {
  try {
    const history = await getHistory()
    
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
    
    await storage.setItem(STORAGE_KEY, history)
  } catch (error) {
    console.error('[AI Studio] Failed to save generation:', error)
  }
}

/**
 * Get a single generation by ID
 * @param {string} id
 * @returns {Promise<GenerationRecord | null>}
 */
export async function getGeneration(id) {
  const history = await getHistory()
  return history.find(item => item.id === id) || null
}

/**
 * Delete a generation from history
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function deleteGeneration(id) {
  try {
    const history = await getHistory()
    const filtered = history.filter(item => item.id !== id)
    await storage.setItem(STORAGE_KEY, filtered)
  } catch (error) {
    console.error('[AI Studio] Failed to delete generation:', error)
  }
}

/**
 * Clear all history
 * @returns {Promise<void>}
 */
export async function clearHistory() {
  try {
    await storage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('[AI Studio] Failed to clear history:', error)
  }
}

/**
 * Get history filtered by type
 * @param {'image' | 'video'} type
 * @returns {Promise<GenerationRecord[]>}
 */
export async function getHistoryByType(type) {
  const history = await getHistory()
  return history.filter(item => item.type === type)
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
