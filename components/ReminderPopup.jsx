'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, Clock, AlarmClock } from 'lucide-react'
import { getUpcomingReminders, updateReminder } from '@/lib/reminders/storage'

export default function ReminderPopup() {
  const [activeReminder, setActiveReminder] = useState(null)
  const [mounted, setMounted] = useState(false)

  const checkReminders = useCallback(async () => {
    try {
      const upcoming = await getUpcomingReminders(15)
      if (upcoming.length > 0 && !activeReminder) {
        // Show the earliest upcoming reminder
        const earliest = upcoming.sort((a, b) => 
          new Date(a.remindAt) - new Date(b.remindAt)
        )[0]
        setActiveReminder(earliest)
      }
    } catch (e) {
      console.error('Failed to check reminders:', e)
    }
  }, [activeReminder])

  useEffect(() => {
    setMounted(true)
    
    // Initial check
    checkReminders()
    
    // Check every 30 seconds
    const interval = setInterval(checkReminders, 30000)
    
    return () => clearInterval(interval)
  }, [checkReminders])

  const handleDismiss = async () => {
    if (!activeReminder) return
    try {
      await updateReminder(activeReminder.id, { dismissed: true })
      setActiveReminder(null)
    } catch (e) {
      console.error('Failed to dismiss reminder:', e)
    }
  }

  const handleSnooze = async () => {
    if (!activeReminder) return
    try {
      const newTime = new Date(new Date().getTime() + 10 * 60 * 1000).toISOString()
      await updateReminder(activeReminder.id, { remindAt: newTime })
      setActiveReminder(null)
    } catch (e) {
      console.error('Failed to snooze reminder:', e)
    }
  }

  if (!mounted || !activeReminder) return null

  const remindTime = new Date(activeReminder.remindAt)
  const timeStr = remindTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-[hsl(0,0%,7%)] border border-purple-500/30 rounded-2xl max-w-md w-full p-6 animate-fade-in shadow-2xl shadow-purple-500/20">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <AlarmClock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Reminder</h2>
            <p className="text-sm text-gray-400">Coming up soon</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">{activeReminder.title}</h3>
          <div className="flex items-center gap-2 text-purple-400">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{timeStr}</span>
          </div>
          {activeReminder.notes && (
            <p className="text-gray-400 text-sm mt-3 border-t border-gray-800 pt-3">
              {activeReminder.notes}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSnooze}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
          >
            Snooze 10 min
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-500 hover:to-pink-500 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
