// Storage layer for Profile feature
// Will be replaced with Supabase later

const PROFILE_KEY = 'novatok_profile'

/**
 * Get profile data from localStorage
 * @returns {{ displayName: string, bio: string, updatedAt: string } | null}
 */
export function getProfile() {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(PROFILE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * Save profile data to localStorage
 * Simulates network latency (400-600ms)
 * @param {{ displayName: string, bio: string }} data
 * @returns {Promise<{ displayName: string, bio: string, updatedAt: string }>}
 */
export async function saveProfile({ displayName, bio }) {
  // Simulate network delay (400-600ms)
  const delay = 400 + Math.random() * 200
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const profile = {
          displayName: displayName.trim(),
          bio: bio.trim(),
          updatedAt: new Date().toISOString()
        }
        
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
        resolve(profile)
      } catch (error) {
        reject(new Error('Failed to save profile'))
      }
    }, delay)
  })
}

/**
 * Get display name with fallback
 */
export function getDisplayName() {
  const profile = getProfile()
  return profile?.displayName || 'NovaTok User'
}

/**
 * Get bio with fallback
 */
export function getBio() {
  const profile = getProfile()
  return profile?.bio || 'No bio yet'
}
