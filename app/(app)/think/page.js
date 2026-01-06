'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Lightbulb, Send, Lock, Unlock, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { saveThought, isQuietVoicesUnlocked, unlockQuietVoices, getThoughtCount } from '@/lib/think/storage'

const MOODS = [
  { id: 'inspired', label: 'Inspired', emoji: '🌟' },
  { id: 'reflective', label: 'Reflective', emoji: '💭' },
  { id: 'passionate', label: 'Passionate', emoji: '🔥' },
  { id: 'calm', label: 'Calm', emoji: '🌙' },
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'hopeful', label: 'Hopeful', emoji: '💫' },
]

export default function ThinkPage() {
  const [text, setText] = useState('')
  const [selectedMood, setSelectedMood] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [quietVoicesUnlocked, setQuietVoicesUnlocked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const textareaRef = useRef(null)
  const { toast } = useToast()

  // Check unlock status on mount
  useEffect(() => {
    setMounted(true)
    setQuietVoicesUnlocked(isQuietVoicesUnlocked())
  }, [])

  // Handle text change - optimized for smooth typing
  const handleTextChange = useCallback((e) => {
    setText(e.target.value)
  }, [])

  // Handle mood selection
  const handleMoodSelect = useCallback((moodId) => {
    setSelectedMood(prev => prev === moodId ? null : moodId)
  }, [])

  // Handle release button click
  const handleRelease = async () => {
    // Validation
    if (!text.trim()) {
      toast({ type: 'error', message: 'Write something first' })
      textareaRef.current?.focus()
      return
    }

    setIsLoading(true)

    try {
      const wasUnlocked = isQuietVoicesUnlocked()
      
      // Save the thought
      await saveThought({
        text: text.trim(),
        mood: selectedMood || 'neutral'
      })

      // Check if this is the first thought (unlock Quiet Voices)
      if (!wasUnlocked) {
        unlockQuietVoices()
        setQuietVoicesUnlocked(true)
        // Show unlock toast after success toast
        setTimeout(() => {
          toast({ type: 'unlock', message: 'Quiet Voices unlocked' })
        }, 500)
      }

      // Success
      toast({ type: 'success', message: 'Thought released ✓' })
      setText('')
      setSelectedMood(null)
      
    } catch (error) {
      toast({ type: 'error', message: error.message || 'Failed to save thought' })
    } finally {
      setIsLoading(false)
    }
  }

  // Prevent hydration mismatch
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
      {/* Main Think Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Think</h1>
              <p className="text-sm text-gray-500">Let your thoughts flow freely</p>
            </div>
          </div>
        </div>

        {/* Textarea */}
        <div className="p-5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            placeholder="What's on your mind?"
            disabled={isLoading}
            className="w-full h-32 bg-transparent text-white placeholder-gray-600 resize-none focus:outline-none text-base leading-relaxed"
            maxLength={500}
          />
          
          {/* Character count */}
          <div className="flex justify-end mt-2">
            <span className={`text-xs ${text.length > 450 ? 'text-orange-400' : 'text-gray-600'}`}>
              {text.length}/500
            </span>
          </div>
        </div>

        {/* Mood Selection */}
        <div className="px-5 pb-4">
          <p className="text-xs text-gray-500 mb-3">How are you feeling?</p>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((mood) => {
              const isSelected = selectedMood === mood.id
              return (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood.id)}
                  disabled={isLoading}
                  className={`
                    px-3 py-1.5 rounded-full text-sm font-medium
                    transition-all duration-200 ease-out
                    active:scale-95
                    ${isSelected
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg shadow-purple-500/20'
                      : 'bg-gray-800/80 text-gray-400 hover:bg-gray-700/80 hover:text-gray-300'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  <span className="mr-1.5">{mood.emoji}</span>
                  {mood.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Release Button */}
        <div className="p-5 pt-2 border-t border-gray-800/50">
          <button
            onClick={handleRelease}
            disabled={isLoading}
            className={`
              w-full py-3.5 rounded-xl font-semibold text-white
              flex items-center justify-center gap-2
              transition-all duration-200 ease-out
              active:scale-[0.98]
              ${isLoading
                ? 'bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25'
              }
            `}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Releasing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Release</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Quiet Voices Card */}
      <div
        className={`
          relative overflow-hidden rounded-2xl border transition-all duration-500
          ${quietVoicesUnlocked
            ? 'bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30'
            : 'bg-[hsl(0,0%,7%)] border-gray-800'
          }
        `}
      >
        {/* Lock overlay for locked state */}
        {!quietVoicesUnlocked && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                <Lock className="w-5 h-5 text-gray-500" />
              </div>
              <p className="text-sm text-gray-500">Release your first thought to unlock</p>
            </div>
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center border
              ${quietVoicesUnlocked
                ? 'bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-purple-500/40'
                : 'bg-gray-800 border-gray-700'
              }
            `}>
              {quietVoicesUnlocked ? (
                <Sparkles className="w-5 h-5 text-purple-400" />
              ) : (
                <Lock className="w-5 h-5 text-gray-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-semibold ${quietVoicesUnlocked ? 'text-white' : 'text-gray-600'}`}>
                  Quiet Voices
                </h2>
                {quietVoicesUnlocked && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    Unlocked
                  </span>
                )}
              </div>
              <p className={`text-sm ${quietVoicesUnlocked ? 'text-gray-400' : 'text-gray-600'}`}>
                Anonymous thoughts from the community
              </p>
            </div>
          </div>

          {quietVoicesUnlocked && (
            <div className="mt-4 p-4 rounded-xl bg-black/20 border border-purple-500/20">
              <p className="text-sm text-gray-400 italic">
                "The quietest minds often hold the loudest truths..."
              </p>
              <p className="text-xs text-gray-600 mt-2">— Coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
