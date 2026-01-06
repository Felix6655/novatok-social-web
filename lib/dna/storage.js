// Storage layer for DNA Profile feature (Optional SoulMate feature)
// Supports both localStorage (dev) and Supabase (prod)

import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { isDevelopment } from '@/lib/supabase/health'

const STORAGE_KEY = 'novatok_dna_profile_dev'

function shouldUseFallback() {
  return !supabase && isDevelopment()
}

/**
 * Get DNA profile for current user
 */
export async function getDnaProfile() {
  if (shouldUseFallback()) {
    return getDnaProfileLocal()
  }

  if (!supabase) return null

  const user = await getCurrentUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('dna_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // No profile found
    console.error('Failed to get DNA profile:', error)
    return null
  }

  return {
    id: data.id,
    provider: data.provider,
    kitId: data.kit_id,
    consent: data.consent,
    createdAt: data.created_at
  }
}

/**
 * Save DNA profile for current user
 */
export async function saveDnaProfile({ provider, kitId, consent }) {
  if (shouldUseFallback()) {
    return saveDnaProfileLocal({ provider, kitId, consent })
  }

  if (!supabase) throw new Error('Database not configured')

  const user = await getCurrentUser()
  if (!user) throw new Error('You must be logged in')

  const { data, error } = await supabase
    .from('dna_profiles')
    .upsert({
      user_id: user.id,
      provider,
      kit_id: kitId,
      consent
    }, {
      onConflict: 'user_id'
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to save DNA profile:', error)
    throw new Error('Failed to save DNA profile')
  }

  return {
    id: data.id,
    provider: data.provider,
    kitId: data.kit_id,
    consent: data.consent,
    createdAt: data.created_at
  }
}

/**
 * Delete DNA profile
 */
export async function deleteDnaProfile() {
  if (shouldUseFallback()) {
    return deleteDnaProfileLocal()
  }

  if (!supabase) throw new Error('Database not configured')

  const user = await getCurrentUser()
  if (!user) throw new Error('You must be logged in')

  const { error } = await supabase
    .from('dna_profiles')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to delete DNA profile:', error)
    throw new Error('Failed to delete DNA profile')
  }
}

// ==========================================
// LocalStorage fallback functions (DEV ONLY)
// ==========================================

function getDnaProfileLocal() {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

async function saveDnaProfileLocal({ provider, kitId, consent }) {
  const profile = {
    id: 'local_dna_profile',
    provider,
    kitId,
    consent,
    createdAt: new Date().toISOString()
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
  return profile
}

async function deleteDnaProfileLocal() {
  localStorage.removeItem(STORAGE_KEY)
}
