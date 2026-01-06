// Storage layer for Reminders feature
// Supports both localStorage (dev) and Supabase (prod)

import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { isDevelopment } from '@/lib/supabase/health'

const STORAGE_KEY = 'novatok_reminders_dev'

function shouldUseFallback() {
  return !supabase && isDevelopment()
}

/**
 * Generate unique ID
 */
function generateId() {
  return `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get all reminders for current user
 */
export async function getReminders() {
  if (shouldUseFallback()) {
    return getRemindersLocal()
  }

  if (!supabase) return []

  const user = await getCurrentUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', user.id)
    .order('remind_at', { ascending: true })

  if (error) {
    console.error('Failed to get reminders:', error)
    return []
  }

  return (data || []).map(r => ({
    id: r.id,
    title: r.title,
    remindAt: r.remind_at,
    notes: r.notes,
    dismissed: r.dismissed,
    createdAt: r.created_at
  }))
}

/**
 * Create a new reminder
 */
export async function createReminder({ title, remindAt, notes }) {
  if (shouldUseFallback()) {
    return createReminderLocal({ title, remindAt, notes })
  }

  if (!supabase) throw new Error('Database not configured')

  const user = await getCurrentUser()
  if (!user) throw new Error('You must be logged in')

  const { data, error } = await supabase
    .from('reminders')
    .insert({
      user_id: user.id,
      title,
      remind_at: remindAt,
      notes: notes || null,
      dismissed: false
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create reminder:', error)
    throw new Error('Failed to create reminder')
  }

  return {
    id: data.id,
    title: data.title,
    remindAt: data.remind_at,
    notes: data.notes,
    dismissed: data.dismissed,
    createdAt: data.created_at
  }
}

/**
 * Update a reminder (dismiss or snooze)
 */
export async function updateReminder(id, updates) {
  if (shouldUseFallback()) {
    return updateReminderLocal(id, updates)
  }

  if (!supabase) throw new Error('Database not configured')

  const user = await getCurrentUser()
  if (!user) throw new Error('You must be logged in')

  const updateData = {}
  if (updates.dismissed !== undefined) updateData.dismissed = updates.dismissed
  if (updates.remindAt !== undefined) updateData.remind_at = updates.remindAt

  const { error } = await supabase
    .from('reminders')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to update reminder:', error)
    throw new Error('Failed to update reminder')
  }
}

/**
 * Delete a reminder
 */
export async function deleteReminder(id) {
  if (shouldUseFallback()) {
    return deleteReminderLocal(id)
  }

  if (!supabase) throw new Error('Database not configured')

  const user = await getCurrentUser()
  if (!user) throw new Error('You must be logged in')

  const { error } = await supabase
    .from('reminders')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Failed to delete reminder:', error)
    throw new Error('Failed to delete reminder')
  }
}

/**
 * Get upcoming reminders (within next N minutes)
 */
export async function getUpcomingReminders(minutes = 15) {
  const reminders = await getReminders()
  const now = new Date()
  const threshold = new Date(now.getTime() + minutes * 60 * 1000)
  
  return reminders.filter(r => {
    if (r.dismissed) return false
    const remindAt = new Date(r.remindAt)
    return remindAt >= now && remindAt <= threshold
  })
}

// ==========================================
// LocalStorage fallback functions (DEV ONLY)
// ==========================================

function getRemindersLocal() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveRemindersLocal(reminders) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders))
}

async function createReminderLocal({ title, remindAt, notes }) {
  const reminders = getRemindersLocal()
  const newReminder = {
    id: generateId(),
    title,
    remindAt,
    notes: notes || null,
    dismissed: false,
    createdAt: new Date().toISOString()
  }
  reminders.push(newReminder)
  saveRemindersLocal(reminders)
  return newReminder
}

async function updateReminderLocal(id, updates) {
  const reminders = getRemindersLocal()
  const index = reminders.findIndex(r => r.id === id)
  if (index !== -1) {
    if (updates.dismissed !== undefined) reminders[index].dismissed = updates.dismissed
    if (updates.remindAt !== undefined) reminders[index].remindAt = updates.remindAt
    saveRemindersLocal(reminders)
  }
}

async function deleteReminderLocal(id) {
  const reminders = getRemindersLocal()
  const filtered = reminders.filter(r => r.id !== id)
  saveRemindersLocal(filtered)
}
