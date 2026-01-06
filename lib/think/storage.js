// Storage layer for Think feature
// Uses Supabase for persistence

import { supabase, getCurrentUser } from '@/lib/supabase/client'

const QUIET_VOICES_KEY = 'think_quiet_voices_unlocked'

/**
 * Save a new thought to Supabase
 * @param {{ text: string, mood: string }} data
 * @returns {Promise<{ id: string, text: string, mood: string, created_at: string }>}
 */
export async function saveThought({ text, mood }) {
  // If Supabase not configured, fall back to localStorage
  if (!supabase) {
    console.warn('Supabase not configured - using localStorage fallback')
    return saveThoughtLocal({ text, mood })
  }

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
  if (!supabase) {
    return getThoughtCountLocal()
  }

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
  if (!supabase) {
    return getThoughtsLocal()
  }

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
 * (Still uses localStorage as it's a client-side unlock)
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
// LocalStorage fallback functions (for dev)
// ==========================================

const STORAGE_KEY = 'novatok_thoughts'

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
