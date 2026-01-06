'use client'

import { useState, useEffect } from 'react'
import { 
  Bookmark, Lightbulb, Sparkles, Star, Clock, 
  Trash2, Filter, LayoutGrid
} from 'lucide-react'
import { getSavedItems, unsaveItem } from '@/lib/saved/storage'
import { useToast } from '@/components/ui/ToastProvider'

// Type configurations
const TYPE_CONFIG = {
  think: {
    icon: Lightbulb,
    label: 'Thought',
    colors: {
      bg: 'from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-400'
    }
  },
  tarot: {
    icon: Sparkles,
    label: 'Tarot',
    colors: {
      bg: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-400'
    }
  },
  horoscope: {
    icon: Star,
    label: 'Horoscope',
    colors: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-400'
    }
  },
  memory: {
    icon: Clock,
    label: 'Memory',
    colors: {
      bg: 'from-pink-500/20 to-purple-500/20',
      border: 'border-pink-500/30',
      icon: 'text-pink-400',
      badge: 'bg-pink-500/20 text-pink-400'
    }
  }
}

// Filter tabs
const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'think', label: 'Think' },
  { id: 'tarot', label: 'Tarot' },
  { id: 'horoscope', label: 'Horoscope' }
]

function formatSavedDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

function SavedCard({ item, onRemove }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.memory
  const Icon = config.icon

  return (
    <div className={`bg-[hsl(0,0%,7%)] rounded-xl border ${config.colors.border} p-4 card-hover group`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${config.colors.bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.colors.icon}`} />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="text-sm font-medium text-white truncate">{item.title}</h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.colors.badge}`}>
                {config.label}
              </span>
              <button
                onClick={() => onRemove(item)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
                title="Remove from saved"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Summary */}
          <p className="text-sm text-gray-400 mb-2 line-clamp-2">{item.summary}</p>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Saved {formatSavedDate(item.savedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bookmark className="w-3 h-3 fill-current" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ filter }) {
  const filterLabel = filter === 'all' ? '' : ` ${filter}`
  
  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
      <div className="text-center py-12">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-[hsl(0,0%,7%)] flex items-center justify-center border border-amber-500/30">
            <Bookmark className="w-8 h-8 text-amber-400" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">
          {filter === 'all' ? "You haven't saved anything yet" : `No saved ${filter} items`}
        </h2>
        <p className="text-gray-400 max-w-sm mx-auto mb-6">
          {filter === 'all' 
            ? "Save thoughts, tarot readings, and horoscopes to come back to them later."
            : `Save ${filter} items to see them here.`
          }
        </p>
        
        {filter === 'all' && (
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <Lightbulb className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">Save Thoughts</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">Save Readings</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Star className="w-5 h-5 text-blue-400 mx-auto mb-1" />
              <p className="text-[10px] text-gray-400">Save Horoscopes</p>
            </div>
          </div>
        )}
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

export default function SavedPage() {
  const { toast } = useToast()
  const [savedItems, setSavedItems] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    loadSavedItems()
  }, [mounted])

  function loadSavedItems() {
    setIsLoading(true)
    try {
      const items = getSavedItems()
      setSavedItems(items)
    } catch (error) {
      console.error('Failed to load saved items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleRemove(item) {
    const success = unsaveItem(item.type, item.sourceId)
    if (success) {
      setSavedItems(prev => prev.filter(s => s.id !== item.id))
      toast({ type: 'info', message: 'Removed from Saved' })
    }
  }

  // Filter items
  const filteredItems = activeFilter === 'all' 
    ? savedItems 
    : savedItems.filter(item => item.type === activeFilter)

  // Count by type
  const countByType = {
    all: savedItems.length,
    think: savedItems.filter(i => i.type === 'think').length,
    tarot: savedItems.filter(i => i.type === 'tarot').length,
    horoscope: savedItems.filter(i => i.type === 'horoscope').length
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-800/50 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center border border-amber-500/30">
            <Bookmark className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Saved</h1>
            <p className="text-sm text-gray-500">Keep the things you want to come back to</p>
          </div>
        </div>
        
        {savedItems.length > 0 && (
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{savedItems.length}</span>
            <p className="text-xs text-gray-500">saved items</p>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {savedItems.length > 0 && (
        <div className="flex items-center gap-2 p-1 bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeFilter === tab.id
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
              }`}
            >
              <span>{tab.label}</span>
              {countByType[tab.id] > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeFilter === tab.id 
                    ? 'bg-gray-700 text-gray-300' 
                    : 'bg-gray-800 text-gray-500'
                }`}>
                  {countByType[tab.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : filteredItems.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <div className="space-y-3">
          {filteredItems.map(item => (
            <SavedCard key={item.id} item={item} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  )
}
