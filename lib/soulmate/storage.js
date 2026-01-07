// SoulMate storage layer
// Handles profile loading and caching

import { generateProfiles, getFilteredProfiles } from './profileGenerator'

const STORAGE_KEY = 'novatok_soulmate_profiles_v1'
const LIKED_KEY = 'novatok_soulmate_liked'
const PASSED_KEY = 'novatok_soulmate_passed'
const SUPERLIKED_KEY = 'novatok_soulmate_superliked'
const MATCHES_KEY = 'novatok_soulmate_matches'

let cachedProfiles = null

/**
 * Load or generate profiles
 * Uses localStorage cache for faster subsequent loads
 */
export function loadProfiles() {
  if (typeof window === 'undefined') return []
  
  // Return cached profiles if available
  if (cachedProfiles) return cachedProfiles
  
  try {
    // Try to load from localStorage first
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed.length >= 5000) {
        cachedProfiles = parsed
        return cachedProfiles
      }
    }
  } catch (e) {
    console.warn('Failed to load cached profiles:', e)
  }
  
  // Generate new profiles
  console.log('Generating 5,000 profiles...')
  const startTime = performance.now()
  cachedProfiles = generateProfiles(5000)
  const endTime = performance.now()
  console.log(`Generated ${cachedProfiles.length} profiles in ${(endTime - startTime).toFixed(2)}ms`)
  
  // Cache to localStorage (may fail if too large, that's okay)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedProfiles))
  } catch (e) {
    console.warn('Could not cache profiles to localStorage:', e)
  }
  
  return cachedProfiles
}

/**
 * Get viewed profile IDs (liked, passed, superliked)
 */
export function getViewedIds() {
  if (typeof window === 'undefined') return new Set()
  
  try {
    const liked = JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')
    const passed = JSON.parse(localStorage.getItem(PASSED_KEY) || '[]')
    const superliked = JSON.parse(localStorage.getItem(SUPERLIKED_KEY) || '[]')
    return new Set([...liked, ...passed, ...superliked])
  } catch {
    return new Set()
  }
}

/**
 * Get unviewed profiles with optional filters
 */
export function getUnviewedProfiles(options = {}) {
  const profiles = loadProfiles()
  const viewedIds = getViewedIds()
  const unviewed = profiles.filter(p => !viewedIds.has(p.id))
  return getFilteredProfiles(unviewed, options)
}

/**
 * Record a like
 */
export function recordLike(profileId) {
  if (typeof window === 'undefined') return
  
  try {
    const liked = JSON.parse(localStorage.getItem(LIKED_KEY) || '[]')
    if (!liked.includes(profileId)) {
      liked.push(profileId)
      localStorage.setItem(LIKED_KEY, JSON.stringify(liked))
      
      // Simulate match (30% chance)
      if (Math.random() < 0.30) {
        recordMatch(profileId)
        return true // It's a match!
      }
    }
  } catch (e) {
    console.error('Failed to record like:', e)
  }
  return false
}

/**
 * Record a pass
 */
export function recordPass(profileId) {
  if (typeof window === 'undefined') return
  
  try {
    const passed = JSON.parse(localStorage.getItem(PASSED_KEY) || '[]')
    if (!passed.includes(profileId)) {
      passed.push(profileId)
      localStorage.setItem(PASSED_KEY, JSON.stringify(passed))
    }
  } catch (e) {
    console.error('Failed to record pass:', e)
  }
}

/**
 * Record a super like
 */
export function recordSuperLike(profileId) {
  if (typeof window === 'undefined') return
  
  try {
    const superliked = JSON.parse(localStorage.getItem(SUPERLIKED_KEY) || '[]')
    if (!superliked.includes(profileId)) {
      superliked.push(profileId)
      localStorage.setItem(SUPERLIKED_KEY, JSON.stringify(superliked))
      
      // Super likes have higher match rate (50%)
      if (Math.random() < 0.50) {
        recordMatch(profileId)
        return true // It's a match!
      }
    }
  } catch (e) {
    console.error('Failed to record super like:', e)
  }
  return false
}

/**
 * Record a match
 */
function recordMatch(profileId) {
  if (typeof window === 'undefined') return
  
  try {
    const matches = JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]')
    if (!matches.includes(profileId)) {
      matches.push(profileId)
      localStorage.setItem(MATCHES_KEY, JSON.stringify(matches))
    }
  } catch (e) {
    console.error('Failed to record match:', e)
  }
}

/**
 * Get all matches
 */
export function getMatches() {
  if (typeof window === 'undefined') return []
  
  try {
    const matchIds = JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]')
    const profiles = loadProfiles()
    return profiles.filter(p => matchIds.includes(p.id))
  } catch {
    return []
  }
}

/**
 * Get stats
 */
export function getStats() {
  if (typeof window === 'undefined') return { liked: 0, passed: 0, superliked: 0, matches: 0 }
  
  try {
    const liked = JSON.parse(localStorage.getItem(LIKED_KEY) || '[]').length
    const passed = JSON.parse(localStorage.getItem(PASSED_KEY) || '[]').length
    const superliked = JSON.parse(localStorage.getItem(SUPERLIKED_KEY) || '[]').length
    const matches = JSON.parse(localStorage.getItem(MATCHES_KEY) || '[]').length
    return { liked, passed, superliked, matches }
  } catch {
    return { liked: 0, passed: 0, superliked: 0, matches: 0 }
  }
}

/**
 * Reset all data (for testing)
 */
export function resetAllData() {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(LIKED_KEY)
  localStorage.removeItem(PASSED_KEY)
  localStorage.removeItem(SUPERLIKED_KEY)
  localStorage.removeItem(MATCHES_KEY)
  // Don't remove profiles cache
}
