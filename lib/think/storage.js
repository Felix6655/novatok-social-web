// Storage layer for Think feature
// Uses Supabase for persistence (localStorage fallback in development only)

import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { isDevelopment, isProduction } from '@/lib/supabase/health'

const QUIET_VOICES_KEY = 'think_quiet_voices_unlocked'

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
    // In development, this shouldn't be called if shouldUseFallback() is true
    throw new Error('Supabase not configured')
  }
}

/**
 * Save a new thought to Supabase
 * @param {{ text: string, mood: string }} data
 * @returns {Promise<{ id: string, text: string, mood: string, created_at: string }>}
 */
export async function saveThought({ text, mood }) {
  // Development fallback
  if (shouldUseFallback()) {
    console.warn('[DEV] Using localStorage fallback for saveThought')
    return saveThoughtLocal({ text, mood })
  }

  requireSupabase()

  const user = await getCurrentUser()
  if (!user) {
    throw new Error('You must be logged in to save thoughts')
  }

  const { data, error } = await supabase
    .from('thoughts')
    .insert({
      user_id: user.id,
      text: text.trim(),
      mood: mood || 'neutral'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save thought:', error)
    throw new Error('Failed to save thought')
  }

  return data
}

/**
 * Get thoughts count for current user
 * @returns {Promise<number>}
 */
export async function getThoughtCount() {
  // Development fallback
  if (shouldUseFallback()) {
    return getThoughtCountLocal()
  }

  if (!supabase) return 0

  const user = await getCurrentUser()
  if (!user) return 0

  const { count, error } = await supabase
    .from('thoughts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to get thought count:', error)
    return 0
  }

  return count || 0
}

/**
 * Get all thoughts for current user
 * @returns {Promise<Array>}
 */
export async function getThoughts() {
  // Development fallback
  if (shouldUseFallback()) {
    return getThoughtsLocal()
  }

  if (!supabase) return []

  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('thoughts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to get thoughts:', error)
    return []
  }

  return data || []
}

/**
 * Check if Quiet Voices is unlocked
 * (Uses localStorage as it's a client-side UI unlock, not user data)
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

// ==========================================
// LocalStorage fallback functions (DEV ONLY)
// ==========================================

const STORAGE_KEY = 'novatok_thoughts_dev'

function generateId() {
  return `thought_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getThoughtsLocal() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function getThoughtCountLocal() {
  return getThoughtsLocal().length
}

async function saveThoughtLocal({ text, mood }) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 300))
  
  const thoughts = getThoughtsLocal()
  const newThought = {
    id: generateId(),
    text: text.trim(),
    mood,
    created_at: new Date().toISOString()
  }
  
  thoughts.unshift(newThought)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(thoughts))
  
  return newThought
}
