'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, Lightbulb, Sparkles, Star, Calendar, 
  MessageCircle, Heart, Briefcase, Smile, Bookmark 
} from 'lucide-react'
import { 
  getAggregatedMemories, 
  groupMemoriesByDate, 
  formatMemoryDate,
  MEMORY_TYPES 
} from '@/lib/memories/aggregate'
import { saveItem, isSaved, unsaveItem } from '@/lib/saved/storage'
import { useToast } from '@/components/ui/ToastProvider'

// Memory type icon mapping
const TYPE_ICONS = {
  [MEMORY_TYPES.THINK]: Lightbulb,
  [MEMORY_TYPES.TAROT]: Sparkles,
  [MEMORY_TYPES.HOROSCOPE]: Star
}

// Memory type colors
const TYPE_COLORS = {
  [MEMORY_TYPES.THINK]: {
    bg: 'from-yellow-500/20 to-amber-500/20',
    border: 'border-yellow-500/30',
    icon: 'text-yellow-400',
    badge: 'bg-yellow-500/20 text-yellow-400'
  },
  [MEMORY_TYPES.TAROT]: {
    bg: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    icon: 'text-purple-400',
    badge: 'bg-purple-500/20 text-purple-400'
  },
  [MEMORY_TYPES.HOROSCOPE]: {
    bg: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-400'
  }
}

// Memory type labels
const TYPE_LABELS = {
  [MEMORY_TYPES.THINK]: 'Thought',
  [MEMORY_TYPES.TAROT]: 'Tarot',
  [MEMORY_TYPES.HOROSCOPE]: 'Horoscope'
}

// Mood emoji mapping
const MOOD_EMOJI = {
  release: '🍃',
  vent: '💨',
  reflect: '🪞',
  hopeful: '✨',
  neutral: '💭'
}

function MemoryCard({ memory, onSaveToggle }) {
  const colors = TYPE_COLORS[memory.type]
  const Icon = TYPE_ICONS[memory.type]
  const [saved, setSaved] = useState(false)
  
  useEffect(() => {
    setSaved(isSaved(memory.type, memory.id))
  }, [memory.type, memory.id])
  
  const handleSaveToggle = () => {
    if (saved) {
      unsaveItem(memory.type, memory.id)
      setSaved(false)
      onSaveToggle?.(false)
    } else {
      saveItem({
        type: memory.type,
        sourceId: memory.id,
        title: memory.title,
        summary: memory.summary,
        metadata: memory.metadata,
        createdAt: memory.createdAt
      })
      setSaved(true)
      onSaveToggle?.(true)
    }
  }
  
  return (
    <div className={`bg-[hsl(0,0%,7%)] rounded-xl border ${colors.border} p-4 card-hover group`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-medium text-white truncate">{memory.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${colors.badge}`}>
                {TYPE_LABELS[memory.type]}
              </span>
              <button
                onClick={handleSaveToggle}
                className={`p-1 rounded-md transition-all ${
                  saved 
                    ? 'text-amber-400 hover:text-amber-300' 
                    : 'opacity-0 group-hover:opacity-100 text-gray-500 hover:text-amber-400'
                }`}
                title={saved ? 'Remove from saved' : 'Save'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
          
          {/* Summary */}
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">{memory.summary}</p>
          
          {/* Type-specific metadata */}
          {memory.type === MEMORY_TYPES.THINK && memory.metadata.mood && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{MOOD_EMOJI[memory.metadata.mood] || '💭'}</span>
              <span className="capitalize">{memory.metadata.mood}</span>
            </div>
          )}
          
          {memory.type === MEMORY_TYPES.TAROT && memory.metadata.cardNames && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="truncate">{memory.metadata.cardNames}</span>
            </div>
          )}
          
          {memory.type === MEMORY_TYPES.HOROSCOPE && memory.metadata.sign && (
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <span className="text-base">{memory.metadata.sign.symbol}</span>
                <span>{memory.metadata.sign.name}</span>
              </span>
              <span className="flex items-center gap-1">
                <span>🍀</span>
                <span>{memory.metadata.luckyNumber}</span>
              </span>
              <span className="flex items-center gap-1">
                <span>🎨</span>
                <span>{memory.metadata.luckyColor}</span>
              </span>
            </div>
          )}
          
          {/* Timestamp */}
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{formatMemoryDate(memory.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function DateSeparator({ label, count }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-400">{label}</span>
        <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="flex-1 h-px bg-gray-800" />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
      <div className="text-center py-12">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-[hsl(0,0%,7%)] flex items-center justify-center border border-pink-500/30">
            <Clock className="w-8 h-8 text-pink-400" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">No memories yet</h2>
        <p className="text-gray-400 max-w-sm mx-auto mb-6">
          Your memories will appear here as you use NovaTok. Start by sharing a thought, getting a tarot reading, or checking your horoscope.
        </p>
        
        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Lightbulb className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">Share Thoughts</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">Tarot Reading</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <Star className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-[10px] text-gray-400">Horoscope</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800 p-4 animate-pulse">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-800" />
            <div className="flex-1">
              <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-800 rounded w-full mb-1" />
              <div className="h-3 bg-gray-800 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MemoriesPage() {
  const { toast } = useToast()
  const [memories, setMemories] = useState([])
  const [groupedMemories, setGroupedMemories] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function loadMemories() {
      setIsLoading(true)
      try {
        const allMemories = await getAggregatedMemories()
        setMemories(allMemories)
        setGroupedMemories(groupMemoriesByDate(allMemories))
      } catch (error) {
        console.error('Failed to load memories:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMemories()
  }, [mounted])

  const handleSaveToggle = (saved) => {
    toast({ type: 'success', message: saved ? 'Saved ✓' : 'Removed from Saved' })
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-800/50 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  const totalCount = memories.length
  const hasMemories = totalCount > 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
            <Clock className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Memories</h1>
            <p className="text-sm text-gray-500">Your past moments, thoughts, and guidance</p>
          </div>
        </div>
        
        {hasMemories && (
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{totalCount}</span>
            <p className="text-xs text-gray-500">total memories</p>
          </div>
        )}
      </div>

      {/* Stats Bar (only show if has memories) */}
      {hasMemories && (
        <div className="flex items-center gap-4 p-3 bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-500/20 flex items-center justify-center">
              <Lightbulb className="w-3 h-3 text-yellow-400" />
            </div>
            <span className="text-sm text-gray-400">
              {memories.filter(m => m.type === MEMORY_TYPES.THINK).length} thoughts
            </span>
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-purple-400" />
            </div>
            <span className="text-sm text-gray-400">
              {memories.filter(m => m.type === MEMORY_TYPES.TAROT).length} readings
            </span>
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
              <Star className="w-3 h-3 text-blue-400" />
            </div>
            <span className="text-sm text-gray-400">
              {memories.filter(m => m.type === MEMORY_TYPES.HOROSCOPE).length} horoscopes
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : !hasMemories ? (
        <EmptyState />
      ) : (
        <div className="space-y-4">
          {/* Today */}
          {groupedMemories.today.length > 0 && (
            <div>
              <DateSeparator label="Today" count={groupedMemories.today.length} />
              <div className="space-y-3 mt-2">
                {groupedMemories.today.map(memory => (
                  <MemoryCard key={memory.id} memory={memory} onSaveToggle={handleSaveToggle} />
                ))}
              </div>
            </div>
          )}

          {/* Yesterday */}
          {groupedMemories.yesterday.length > 0 && (
            <div>
              <DateSeparator label="Yesterday" count={groupedMemories.yesterday.length} />
              <div className="space-y-3 mt-2">
                {groupedMemories.yesterday.map(memory => (
                  <MemoryCard key={memory.id} memory={memory} onSaveToggle={handleSaveToggle} />
                ))}
              </div>
            </div>
          )}

          {/* This Week */}
          {groupedMemories.thisWeek.length > 0 && (
            <div>
              <DateSeparator label="This Week" count={groupedMemories.thisWeek.length} />
              <div className="space-y-3 mt-2">
                {groupedMemories.thisWeek.map(memory => (
                  <MemoryCard key={memory.id} memory={memory} onSaveToggle={handleSaveToggle} />
                ))}
              </div>
            </div>
          )}

          {/* Older */}
          {groupedMemories.older.length > 0 && (
            <div>
              <DateSeparator label="Older" count={groupedMemories.older.length} />
              <div className="space-y-3 mt-2">
                {groupedMemories.older.map(memory => (
                  <MemoryCard key={memory.id} memory={memory} onSaveToggle={handleSaveToggle} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
