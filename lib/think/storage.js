// Storage layer for Think feature
// Will be replaced with Supabase later

const STORAGE_KEY = 'novatok_thoughts'
const QUIET_VOICES_KEY = 'think_quiet_voices_unlocked'

/**
 * Generate a unique ID
 */
function generateId() {
  return `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all saved thoughts from localStorage
 */
export function getThoughts() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save a new thought
 * Simulates network latency (600-900ms)
 * @param {{ text: string, mood: string }} data
 * @returns {Promise<{ id: string, text: string, mood: string, createdAt: string }>}
 */
export async function saveThought({ text, mood }) {
  // Simulate network delay (600-900ms)
  const delay = 600 + Math.random() * 300
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const thoughts = getThoughts()
        
        const newThought = {
          id: generateId(),
          text: text.trim(),
          mood,
          createdAt: new Date().toISOString()
        }
        
        thoughts.unshift(newThought)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts))
        
        resolve(newThought)
      } catch (error) {
        reject(new Error('Failed to save thought'))
      }
    }, delay)
  })
}

/**
 * Check if Quiet Voices is unlocked
 */
export function isQuietVoicesUnlocked() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(QUIET_VOICES_KEY) === 'true'
}

/**
 * Unlock Quiet Voices
 */
export function unlockQuietVoices() {
  if (typeof window === 'undefined') return
  localStorage.setItem(QUIET_VOICES_KEY, 'true')
}

/**
 * Get thought count
 */
export function getThoughtCount() {
  return getThoughts().length
}
