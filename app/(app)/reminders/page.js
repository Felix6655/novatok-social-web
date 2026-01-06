'use client'

import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, Clock, Calendar, Loader2, AlarmClock } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { getReminders, createReminder, deleteReminder } from '@/lib/reminders/storage'

export default function RemindersPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [reminders, setReminders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  // Form state
  const [title, setTitle] = useState('')
  const [remindAt, setRemindAt] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    setMounted(true)
    loadReminders()
  }, [])

  async function loadReminders() {
    try {
      const data = await getReminders()
      // Filter out dismissed and past reminders
      const active = data.filter(r => !r.dismissed && new Date(r.remindAt) > new Date())
      setReminders(active)
    } catch (e) {
      console.error('Failed to load reminders:', e)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleCreate() {
    if (!title.trim()) {
      toast({ type: 'error', message: 'Enter a title' })
      return
    }
    if (!remindAt) {
      toast({ type: 'error', message: 'Select a date and time' })
      return
    }
    if (new Date(remindAt) < new Date()) {
      toast({ type: 'error', message: 'Time must be in the future' })
      return
    }

    setIsSaving(true)
    try {
      await createReminder({
        title: title.trim(),
        remindAt: new Date(remindAt).toISOString(),
        notes: notes.trim() || null
      })
      toast({ type: 'success', message: 'Reminder created!' })
      setTitle('')
      setRemindAt('')
      setNotes('')
      setShowForm(false)
      await loadReminders()
    } catch (e) {
      toast({ type: 'error', message: 'Failed to create reminder' })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete(id) {
    try {
      await deleteReminder(id)
      toast({ type: 'success', message: 'Reminder deleted' })
      await loadReminders()
    } catch (e) {
      toast({ type: 'error', message: 'Failed to delete reminder' })
    }
  }

  const formatDateTime = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeUntil = (dateStr) => {
    const diff = new Date(dateStr) - new Date()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 24) return `${Math.floor(hours / 24)} days`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes} min`
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-800/50 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <AlarmClock className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Reminders</h1>
            <p className="text-sm text-gray-500">Never miss an appointment</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500 transition-all"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
          <h3 className="font-medium text-white mb-4">New Reminder</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-500">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Doctor appointment"
                className="w-full mt-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Date & Time</label>
              <input
                type="datetime-local"
                value={remindAt}
                onChange={(e) => setRemindAt(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional details..."
                className="w-full mt-1 px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 resize-none h-20"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h3 className="font-medium text-white">Upcoming Reminders</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500 mx-auto" />
          </div>
        ) : reminders.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No upcoming reminders</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-purple-400 text-sm hover:text-purple-300"
            >
              Create your first reminder
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {reminders.map((reminder) => (
              <div key={reminder.id} className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white truncate">{reminder.title}</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">{formatDateTime(reminder.remindAt)}</span>
                    <span className="text-purple-400">• in {getTimeUntil(reminder.remindAt)}</span>
                  </div>
                  {reminder.notes && (
                    <p className="text-xs text-gray-500 mt-1 truncate">{reminder.notes}</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(reminder.id)}
                  className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
