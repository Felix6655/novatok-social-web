/**
 * Cross-Platform Storage Adapter
 * 
 * Provides a unified storage API that works on:
 * - Web: localStorage
 * - React Native/Expo: @react-native-async-storage/async-storage
 * 
 * All methods are async for native compatibility.
 * JSON serialization is handled automatically.
 */

// Detect platform
const isServer = typeof window === 'undefined'
const isNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

// Native AsyncStorage reference (lazy loaded)
let AsyncStorage = null

/**
 * Initialize native storage (call this in your app entry if using React Native)
 * @param {Object} storage - AsyncStorage instance from @react-native-async-storage/async-storage
 */
export function initNativeStorage(storage) {
  AsyncStorage = storage
}

/**
 * Get raw value from storage
 * @param {string} key 
 * @returns {Promise<string | null>}
 */
async function getRaw(key) {
  if (isServer) return null
  
  if (isNative && AsyncStorage) {
    return AsyncStorage.getItem(key)
  }
  
  // Web fallback
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.warn('[Storage] Failed to get item:', error)
    return null
  }
}

/**
 * Set raw value in storage
 * @param {string} key 
 * @param {string} value 
 * @returns {Promise<void>}
 */
async function setRaw(key, value) {
  if (isServer) return
  
  if (isNative && AsyncStorage) {
    return AsyncStorage.setItem(key, value)
  }
  
  // Web fallback
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.warn('[Storage] Failed to set item:', error)
  }
}

/**
 * Remove value from storage
 * @param {string} key 
 * @returns {Promise<void>}
 */
async function removeRaw(key) {
  if (isServer) return
  
  if (isNative && AsyncStorage) {
    return AsyncStorage.removeItem(key)
  }
  
  // Web fallback
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('[Storage] Failed to remove item:', error)
  }
}

// ============================================
// JSON Helpers (main public API)
// ============================================

/**
 * Get a JSON-parsed value from storage
 * @param {string} key 
 * @param {*} defaultValue - Value to return if key doesn't exist
 * @returns {Promise<*>}
 */
export async function getItem(key, defaultValue = null) {
  const raw = await getRaw(key)
  if (raw === null) return defaultValue
  
  try {
    return JSON.parse(raw)
  } catch (error) {
    console.warn('[Storage] Failed to parse JSON for key:', key, error)
    return defaultValue
  }
}

/**
 * Set a JSON-serialized value in storage
 * @param {string} key 
 * @param {*} value - Will be JSON.stringify'd
 * @returns {Promise<void>}
 */
export async function setItem(key, value) {
  try {
    const serialized = JSON.stringify(value)
    await setRaw(key, serialized)
  } catch (error) {
    console.warn('[Storage] Failed to serialize value for key:', key, error)
  }
}

/**
 * Remove an item from storage
 * @param {string} key 
 * @returns {Promise<void>}
 */
export async function removeItem(key) {
  await removeRaw(key)
}

/**
 * Clear all storage (use with caution)
 * @returns {Promise<void>}
 */
export async function clear() {
  if (isServer) return
  
  if (isNative && AsyncStorage) {
    return AsyncStorage.clear()
  }
  
  try {
    localStorage.clear()
  } catch (error) {
    console.warn('[Storage] Failed to clear storage:', error)
  }
}

/**
 * Get all keys in storage
 * @returns {Promise<string[]>}
 */
export async function getAllKeys() {
  if (isServer) return []
  
  if (isNative && AsyncStorage) {
    return AsyncStorage.getAllKeys()
  }
  
  try {
    return Object.keys(localStorage)
  } catch (error) {
    console.warn('[Storage] Failed to get keys:', error)
    return []
  }
}

/**
 * Check if storage is available
 * @returns {boolean}
 */
export function isStorageAvailable() {
  if (isServer) return false
  
  if (isNative) {
    return !!AsyncStorage
  }
  
  try {
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, 'test')
    localStorage.removeItem(testKey)
    return true
  } catch (error) {
    return false
  }
}

// Default export as object for convenience
const storage = {
  getItem,
  setItem,
  removeItem,
  clear,
  getAllKeys,
  isStorageAvailable,
  initNativeStorage,
}

export default storage
