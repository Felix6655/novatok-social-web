// Storage layer for Profile feature
// Uses Supabase for persistence (localStorage fallback in development only)

import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { isDevelopment, isProduction } from '@/lib/supabase/health'

/**
 * Check if we should use localStorage fallback
 * Only allowed in development when Supabase is not configured
 */
function shouldUseFallback() {
  return !supabase && isDevelopment()
}

/**
 * Throw error if Supabase is required but not configured
 */
function requireSupabase() {
  if (!supabase) {
    if (isProduction()) {
      throw new Error('Database not configured. Please contact the administrator.')
    }
    throw new Error('Supabase not configured')
  }
}

/**
 * Get profile data from Supabase
 * @returns {Promise<{ displayName: string, bio: string, updatedAt: string } | null>}
 */
export async function getProfile() {
  // Development fallback
  if (shouldUseFallback()) {
    console.warn('[DEV] Using localStorage fallback for getProfile')
    return getProfileLocal()
  }

  if (!supabase) return null

  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    // No profile found is not an error
    if (error.code === 'PGRST116') return null
    console.error('Failed to get profile:', error)
    return null
  }

  // Normalize to consistent field names
  return data ? {
    displayName: data.display_name,
    bio: data.bio,
    updatedAt: data.updated_at,
    userId: data.user_id
  } : null
}

/**
 * Save profile data to Supabase (upsert)
 * @param {{ displayName: string, bio: string }} data
 * @returns {Promise<{ displayName: string, bio: string, updatedAt: string }>}
 */
export async function saveProfile({ displayName, bio }) {
  // Development fallback
  if (shouldUseFallback()) {
    console.warn('[DEV] Using localStorage fallback for saveProfile')
    return saveProfileLocal({ displayName, bio })
  }

  requireSupabase()

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('You must be logged in to save your profile')
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      user_id: user.id,
      display_name: displayName.trim(),
      bio: bio.trim(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save profile:', error)
    throw new Error('Failed to save profile')
  }

  return {
    displayName: data.display_name,
    bio: data.bio,
    updatedAt: data.updated_at
  }
}

/**
 * Get display name with fallback
 */
export async function getDisplayName() {
  const profile = await getProfile()
  return profile?.displayName || 'NovaTok User'
}

/**
 * Get bio with fallback
 */
export async function getBio() {
  const profile = await getProfile()
  return profile?.bio || 'No bio yet'
}

// ==========================================
// LocalStorage fallback functions (DEV ONLY)
// ==========================================

const PROFILE_KEY = 'novatok_profile_dev'

function getProfileLocal() {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(PROFILE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

async function saveProfileLocal({ displayName, bio }) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 200))
  
  const profile = {
    displayName: displayName.trim(),
    bio: bio.trim(),
    updatedAt: new Date().toISOString()
  }
  
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  return profile
}
