'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Home, Lightbulb, Sparkles, Star, Brain, Clock,
  Bookmark, ChevronRight, CheckCircle, XCircle
} from 'lucide-react'
import { getFeedItems, formatFeedDate, FEED_TYPES } from '@/lib/feed/aggregate'
import { saveItem, isSaved, unsaveItem } from '@/lib/saved/storage'
import { useToast } from '@/components/ui/ToastProvider'
import ContinueListeningWidget from '@/components/music/ContinueListeningWidget'
import { addToRecentTracks, getRecentTracks } from '@/lib/music/player'
import { getTrackById } from '@/lib/music/data'

// Type configurations
const TYPE_CONFIG = {
  [FEED_TYPES.THINK]: {
    icon: Lightbulb,
    label: 'Thought',
    colors: {
      bg: 'from-yellow-500/20 to-amber-500/20',
      border: 'border-yellow-500/30',
      icon: 'text-yellow-400',
      badge: 'bg-yellow-500/20 text-yellow-400'
    }
  },
  [FEED_TYPES.TAROT]: {
    icon: Sparkles,
    label: 'Tarot',
    colors: {
      bg: 'from-purple-500/20 to-pink-500/20',
      border: 'border-purple-500/30',
      icon: 'text-purple-400',
      badge: 'bg-purple-500/20 text-purple-400'
    }
  },
  [FEED_TYPES.HOROSCOPE]: {
    icon: Star,
    label: 'Horoscope',
    colors: {
      bg: 'from-blue-500/20 to-cyan-500/20',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      badge: 'bg-blue-500/20 text-blue-400'
    }
  },
  [FEED_TYPES.THINKING]: {
    icon: Brain,
    label: 'Challenge',
    colors: {
      bg: 'from-green-500/20 to-emerald-500/20',
      border: 'border-green-500/30',
      icon: 'text-green-400',
      badge: 'bg-green-500/20 text-green-400'
    }
  }
}

// Quick action buttons
const QUICK_ACTIONS = [
  { 
    id: 'think', 
    label: 'Release a Thought', 
    href: '/think', 
    icon: Lightbulb,
    color: 'from-yellow-500/20 to-amber-500/20',
    border: 'border-yellow-500/30',
    iconColor: 'text-yellow-400'
  },
  { 
    id: 'tarot', 
    label: 'Draw Tarot', 
    href: '/tarot', 
    icon: Sparkles,
    color: 'from-purple-500/20 to-pink-500/20',
    border: 'border-purple-500/30',
    iconColor: 'text-purple-400'
  },
  { 
    id: 'horoscope', 
    label: 'Get Horoscope', 
    href: '/horoscope', 
    icon: Star,
    color: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400'
  },
  { 
    id: 'thinking', 
    label: 'Challenge Me', 
    href: '/thinking', 
    icon: Brain,
    color: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/30',
    iconColor: 'text-green-400'
  }
]

// Mood emoji mapping
const MOOD_EMOJI = {
  release: '🍃',
  vent: '💨',
  reflect: '🪞',
  hopeful: '✨',
  neutral: '💭'
}

function FeedCard({ item, onSaveToggle }) {
  const config = TYPE_CONFIG[item.type]
  const Icon = config.icon
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isSaved(item.type, item.id))
  }, [item.type, item.id])

  const handleSaveToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (saved) {
      unsaveItem(item.type, item.id)
      setSaved(false)
      onSaveToggle?.(false)
    } else {
      saveItem({
        type: item.type,
        sourceId: item.id,
        title: item.title,
        summary: item.summary,
        metadata: item.metadata,
        createdAt: item.createdAt
      })
      setSaved(true)
      onSaveToggle?.(true)
    }
  }

  return (
    <div className={`bg-[hsl(0,0%,7%)] rounded-xl border ${config.colors.border} overflow-hidden card-hover group`}>
      <div className="p-4">
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
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.colors.badge} flex-shrink-0`}>
                {config.label}
              </span>
            </div>
            
            {/* Summary */}
            <p className="text-sm text-gray-400 mb-2 line-clamp-2">{item.summary}</p>
            
            {/* Type-specific metadata */}
            {item.type === FEED_TYPES.THINK && item.metadata?.mood && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <span>{MOOD_EMOJI[item.metadata.mood] || '💭'}</span>
                <span className="capitalize">{item.metadata.mood}</span>
              </div>
            )}
            
            {item.type === FEED_TYPES.TAROT && item.metadata?.cardNames && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span className="truncate">{item.metadata.cardNames}</span>
              </div>
            )}
            
            {item.type === FEED_TYPES.HOROSCOPE && item.metadata?.sign && (
              <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                <span>{item.metadata.sign.symbol} {item.metadata.sign.name}</span>
                <span>🍀 {item.metadata.luckyNumber}</span>
              </div>
            )}
            
            {item.type === FEED_TYPES.THINKING && (
              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                {item.metadata?.isCorrect ? (
                  <span className="flex items-center gap-1 text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Correct
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-400">
                    <XCircle className="w-3 h-3" />
                    Missed
                  </span>
                )}
                <span className="capitalize">• {item.metadata?.difficulty}</span>
              </div>
            )}
            
            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Clock className="w-3 h-3" />
                <span>{formatFeedDate(item.createdAt)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Save Button */}
                <button
                  onClick={handleSaveToggle}
                  className={`p-1.5 rounded-md transition-all ${
                    saved 
                      ? 'text-amber-400 hover:text-amber-300' 
                      : 'text-gray-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                  }`}
                  title={saved ? 'Remove from saved' : 'Save'}
                >
                  <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                </button>
                
                {/* Open Link */}
                <Link
                  href={item.linkTo}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 text-xs font-medium transition-all"
                >
                  Open
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActionsBar() {
  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-4">
      <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Quick Actions</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {QUICK_ACTIONS.map(action => {
          const Icon = action.icon
          return (
            <Link
              key={action.id}
              href={action.href}
              className={`flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${action.color} border ${action.border} hover:scale-[1.02] transition-transform`}
            >
              <Icon className={`w-4 h-4 ${action.iconColor}`} />
              <span className="text-xs font-medium text-white truncate">{action.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
      <div className="text-center py-8">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 animate-pulse" />
          <div className="absolute inset-2 rounded-full bg-[hsl(0,0%,7%)] flex items-center justify-center border border-purple-500/30">
            <Home className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-white mb-2">Your feed is empty</h2>
        <p className="text-gray-400 max-w-sm mx-auto mb-6">
          Start creating content to see it here. Release thoughts, draw tarot cards, check your horoscope, or test your knowledge.
        </p>
        
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon
            return (
              <Link
                key={action.id}
                href={action.href}
                className={`flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${action.color} border ${action.border} hover:scale-[1.02] transition-transform`}
              >
                <Icon className={`w-4 h-4 ${action.iconColor}`} />
                <span className="text-xs font-medium text-white">{action.label}</span>
              </Link>
            )
          })}
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

export default function HomePage() {
  const { toast } = useToast()
  const router = useRouter()
  const [feedItems, setFeedItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function loadFeed() {
      setIsLoading(true)
      try {
        const items = await getFeedItems(20)
        setFeedItems(items)
      } catch (error) {
        console.error('Failed to load feed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeed()
  }, [mounted])

  const handleSaveToggle = (saved) => {
    toast({ type: 'success', message: saved ? 'Saved ✓' : 'Removed from Saved' })
  }

  // Handler to play track and navigate to music page
  const handlePlayTrack = (track) => {
    addToRecentTracks(track.id)
    router.push('/music')
    toast({ type: 'success', message: `Playing "${track.title}"` })
  }

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-16 bg-gray-800/50 rounded-2xl" />
        <div className="h-24 bg-gray-800/50 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  const hasFeedItems = feedItems.length > 0

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <Home className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Home</h1>
            <p className="text-sm text-gray-500">What&apos;s new for you today</p>
          </div>
        </div>
        
        {hasFeedItems && (
          <div className="text-right">
            <span className="text-2xl font-bold text-white">{feedItems.length}</span>
            <p className="text-xs text-gray-500">recent items</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <QuickActionsBar />

      {/* Continue Listening Widget */}
      <ContinueListeningWidget onPlayTrack={handlePlayTrack} maxItems={8} />

      {/* Feed */}
      {isLoading ? (
        <LoadingState />
      ) : !hasFeedItems ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {feedItems.map(item => (
            <FeedCard key={item.id} item={item} onSaveToggle={handleSaveToggle} />
          ))}
        </div>
      )}
    </div>
  )
}
