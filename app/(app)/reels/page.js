'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { 
  Lightbulb, Sparkles, Star, Brain, Bookmark, 
  ExternalLink, Share2, ChevronUp, ChevronDown,
  CheckCircle, XCircle, Play
} from 'lucide-react'
import { 
  getReelItems, 
  getReelConfig, 
  getTypeLabel, 
  getMoodLabel,
  formatFeedDate,
  FEED_TYPES 
} from '@/lib/reels/aggregate'
import { saveItem, isSaved, unsaveItem } from '@/lib/saved/storage'
import { useToast } from '@/components/ui/ToastProvider'

// Type icons
const TYPE_ICONS = {
  [FEED_TYPES.THINK]: Lightbulb,
  [FEED_TYPES.TAROT]: Sparkles,
  [FEED_TYPES.HOROSCOPE]: Star,
  [FEED_TYPES.THINKING]: Brain
}

// Quick action buttons for empty state
const QUICK_ACTIONS = [
  { id: 'think', label: 'Think', href: '/think', icon: Lightbulb, color: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', iconColor: 'text-yellow-400' },
  { id: 'tarot', label: 'Tarot', href: '/tarot', icon: Sparkles, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', iconColor: 'text-purple-400' },
  { id: 'horoscope', label: 'Horoscope', href: '/horoscope', icon: Star, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', iconColor: 'text-blue-400' },
  { id: 'thinking', label: 'Thinking', href: '/thinking', icon: Brain, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', iconColor: 'text-green-400' }
]

function ReelCard({ reel, isActive, onSaveToggle }) {
  const config = getReelConfig(reel.type)
  const Icon = TYPE_ICONS[reel.type]
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setSaved(isSaved(reel.type, reel.id))
  }, [reel.type, reel.id])

  const handleSave = () => {
    if (saved) {
      unsaveItem(reel.type, reel.id)
      setSaved(false)
      onSaveToggle?.(false)
    } else {
      saveItem({
        type: reel.type,
        sourceId: reel.id,
        title: reel.title,
        summary: reel.summary,
        metadata: reel.metadata,
        createdAt: reel.createdAt
      })
      setSaved(true)
      onSaveToggle?.(true)
    }
  }

  const handleShare = () => {
    onSaveToggle?.('share')
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4 md:p-8">
      <div className="relative w-full max-w-lg h-full max-h-[600px] flex flex-col">
        {/* Main Card */}
        <div className={`flex-1 rounded-3xl bg-gradient-to-br ${config.gradient} backdrop-blur-xl border ${config.borderAccent} shadow-2xl overflow-hidden flex flex-col`}>
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-xl ${config.bgAccent} flex items-center justify-center border ${config.borderAccent}`}>
                <Icon className={`w-5 h-5 ${config.accentColor}`} />
              </div>
              <div>
                <span className={`text-sm font-semibold ${config.accentColor}`}>
                  {getTypeLabel(reel.type)}
                </span>
                <p className="text-xs text-white/60">{formatFeedDate(reel.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
              {reel.title}
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-6">
              {reel.summary}
            </p>

            {/* Type-specific metadata */}
            <div className="flex flex-wrap gap-2">
              {reel.type === FEED_TYPES.THINK && reel.metadata?.mood && (
                <span className={`px-3 py-1.5 rounded-full ${config.bgAccent} border ${config.borderAccent} text-sm font-medium text-white/90`}>
                  {getMoodLabel(reel.metadata.mood)}
                </span>
              )}

              {reel.type === FEED_TYPES.TAROT && reel.metadata?.cardNames && (
                <span className={`px-3 py-1.5 rounded-full ${config.bgAccent} border ${config.borderAccent} text-sm font-medium text-white/90`}>
                  {reel.metadata.cardNames}
                </span>
              )}

              {reel.type === FEED_TYPES.HOROSCOPE && reel.metadata?.sign && (
                <>
                  <span className={`px-3 py-1.5 rounded-full ${config.bgAccent} border ${config.borderAccent} text-sm font-medium text-white/90`}>
                    {reel.metadata.sign.symbol} {reel.metadata.sign.name}
                  </span>
                  {reel.metadata.luckyNumber && (
                    <span className={`px-3 py-1.5 rounded-full ${config.bgAccent} border ${config.borderAccent} text-sm font-medium text-white/90`}>
                      🍀 {reel.metadata.luckyNumber}
                    </span>
                  )}
                </>
              )}

              {reel.type === FEED_TYPES.THINKING && (
                <>
                  <span className={`px-3 py-1.5 rounded-full ${config.bgAccent} border ${config.borderAccent} text-sm font-medium text-white/90 flex items-center gap-1`}>
                    {reel.metadata?.isCorrect ? (
                      <><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Correct</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5 text-red-400" /> Missed</>
                    )}
                  </span>
                  {reel.metadata?.difficulty && (
                    <span className={`px-3 py-1.5 rounded-full ${config.bgAccent} border ${config.borderAccent} text-sm font-medium text-white/90 capitalize`}>
                      {reel.metadata.difficulty}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Swipe for more</span>
              <div className="flex items-center gap-1">
                <ChevronUp className="w-4 h-4 text-white/50" />
                <ChevronDown className="w-4 h-4 text-white/50" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Rail (Right side) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+16px)] hidden md:flex flex-col gap-4">
          {/* Save */}
          <button
            onClick={handleSave}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              saved 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20'
            }`}
            title={saved ? 'Remove from saved' : 'Save'}
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>

          {/* Open */}
          <Link
            href={reel.linkTo}
            className="w-12 h-12 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
            title="Open"
          >
            <ExternalLink className="w-5 h-5" />
          </Link>

          {/* Share */}
          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Actions (Bottom) */}
        <div className="md:hidden flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              saved 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-white/10 text-white/70 border border-white/20'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            <span className="text-sm">{saved ? 'Saved' : 'Save'}</span>
          </button>

          <Link
            href={reel.linkTo}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 border border-white/20"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="text-sm">Open</span>
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 border border-white/20"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 animate-pulse" />
          <div className="absolute inset-3 rounded-full bg-[hsl(0,0%,7%)] flex items-center justify-center border border-purple-500/30">
            <Play className="w-10 h-10 text-purple-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-3">No reels yet</h2>
        <p className="text-gray-400 mb-8">
          Your reels will appear as you create content. Start by releasing a thought, drawing tarot, or checking your horoscope.
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {QUICK_ACTIONS.map(action => {
            const Icon = action.icon
            return (
              <Link
                key={action.id}
                href={action.href}
                className={`flex items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${action.color} border ${action.border} hover:scale-[1.02] transition-transform`}
              >
                <Icon className={`w-4 h-4 ${action.iconColor}`} />
                <span className="text-sm font-medium text-white">{action.label}</span>
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
    <div className="h-full w-full flex items-center justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
    </div>
  )
}

export default function ReelsPage() {
  const { toast } = useToast()
  const [reels, setReels] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    async function loadReels() {
      setIsLoading(true)
      try {
        const items = await getReelItems(50)
        setReels(items)
      } catch (error) {
        console.error('Failed to load reels:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadReels()
  }, [mounted])

  // Keyboard navigation
  useEffect(() => {
    if (!mounted || reels.length === 0) return

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        setCurrentIndex(prev => Math.min(prev + 1, reels.length - 1))
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        setCurrentIndex(prev => Math.max(prev - 1, 0))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, reels.length])

  // Scroll to current reel
  useEffect(() => {
    if (containerRef.current && reels.length > 0) {
      const container = containerRef.current
      const scrollHeight = container.clientHeight
      container.scrollTo({
        top: currentIndex * scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [currentIndex, reels.length])

  // Handle scroll snap
  const handleScroll = useCallback(() => {
    if (!containerRef.current || reels.length === 0) return

    const container = containerRef.current
    const scrollTop = container.scrollTop
    const scrollHeight = container.clientHeight
    const newIndex = Math.round(scrollTop / scrollHeight)

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < reels.length) {
      setCurrentIndex(newIndex)
    }
  }, [currentIndex, reels.length])

  const handleSaveToggle = (result) => {
    if (result === 'share') {
      toast({ type: 'info', message: 'Share coming soon' })
    } else {
      toast({ type: 'success', message: result ? 'Saved ✓' : 'Removed from Saved' })
    }
  }

  const goToNext = () => {
    setCurrentIndex(prev => Math.min(prev + 1, reels.length - 1))
  }

  const goToPrev = () => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-80px)] md:h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    )
  }

  const hasReels = reels.length > 0

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen bg-black relative overflow-hidden -m-4 md:-m-6">
      {isLoading ? (
        <LoadingState />
      ) : !hasReels ? (
        <EmptyState />
      ) : (
        <>
          {/* Reels Container */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            style={{ scrollSnapType: 'y mandatory' }}
          >
            {reels.map((reel, index) => (
              <div
                key={reel.id}
                className="h-full w-full snap-start snap-always"
                style={{ scrollSnapAlign: 'start' }}
              >
                <ReelCard 
                  reel={reel} 
                  isActive={index === currentIndex}
                  onSaveToggle={handleSaveToggle}
                />
              </div>
            ))}
          </div>

          {/* Counter */}
          <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
            <span className="text-sm font-medium text-white">
              {currentIndex + 1} / {reels.length}
            </span>
          </div>

          {/* Navigation Buttons (Desktop) */}
          <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 flex-col gap-2">
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex === 0
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
              }`}
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={goToNext}
              disabled={currentIndex === reels.length - 1}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                currentIndex === reels.length - 1
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white border border-white/20'
              }`}
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>

          {/* Keyboard hint */}
          <div className="hidden md:block absolute bottom-6 left-1/2 -translate-x-1/2 text-xs text-white/40">
            Use <kbd className="px-1.5 py-0.5 rounded bg-white/10 mx-1">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white/10 mx-1">↓</kbd> to navigate
          </div>
        </>
      )}
    </div>
  )
}
