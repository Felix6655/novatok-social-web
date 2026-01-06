'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { 
  Lightbulb, Sparkles, Star, Brain, Bookmark, 
  ExternalLink, Share2, ChevronUp, ChevronDown,
  CheckCircle, XCircle, Play, Pause, Volume2, VolumeX,
  Upload, Film, AlertCircle, RefreshCw, Trash2,
  Video, Mic, MicOff, Circle, Square, RotateCcw, Check, X,
  Info, Loader2, Heart, Flame, Smile
} from 'lucide-react'
import { 
  getAllReelItems,
  getReelConfig, 
  getTypeLabel, 
  getMoodLabel,
  formatFeedDate,
  FEED_TYPES,
  REEL_TYPES
} from '@/lib/reels/aggregate'
import {
  validateVideoFile,
  extractVideoMetadata,
  uploadVideo,
  deleteVideo,
  markVideosAsNeedingRelink,
  markVideoAsRelinked,
  formatDuration,
  formatFileSize,
  MAX_FILE_SIZE_MB,
  MAX_RECORDING_DURATION,
  ACCEPTED_EXTENSIONS,
  isMediaRecorderSupported,
  getVideoDevices,
  updateVideoCaption
} from '@/lib/reels/storage'
import {
  REACTION_TYPES,
  REACTION_EMOJIS,
  getReelReactions,
  toggleReaction,
  formatReactionCount
} from '@/lib/reels/reactions'
import { saveItem, isSaved, unsaveItem } from '@/lib/saved/storage'
import { useToast } from '@/components/ui/ToastProvider'

// Type icons
const TYPE_ICONS = {
  [FEED_TYPES.THINK]: Lightbulb,
  [FEED_TYPES.TAROT]: Sparkles,
  [FEED_TYPES.HOROSCOPE]: Star,
  [FEED_TYPES.THINKING]: Brain,
  [REEL_TYPES.VIDEO]: Film
}

// Quick action buttons for empty state
const QUICK_ACTIONS = [
  { id: 'think', label: 'Think', href: '/think', icon: Lightbulb, color: 'from-yellow-500/20 to-amber-500/20', border: 'border-yellow-500/30', iconColor: 'text-yellow-400' },
  { id: 'tarot', label: 'Tarot', href: '/tarot', icon: Sparkles, color: 'from-purple-500/20 to-pink-500/20', border: 'border-purple-500/30', iconColor: 'text-purple-400' },
  { id: 'horoscope', label: 'Horoscope', href: '/horoscope', icon: Star, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/30', iconColor: 'text-blue-400' },
  { id: 'thinking', label: 'Thinking', href: '/thinking', icon: Brain, color: 'from-green-500/20 to-emerald-500/20', border: 'border-green-500/30', iconColor: 'text-green-400' }
]

// Reaction Buttons Component
function ReactionButtons({ reelId, onReact }) {
  const [reactions, setReactions] = useState({ like: 0, funny: 0, fire: 0, userReaction: null })
  
  useEffect(() => {
    setReactions(getReelReactions(reelId))
  }, [reelId])
  
  const handleReaction = (type) => {
    const result = toggleReaction(reelId, type)
    setReactions(result.reactions)
    onReact?.(result.added, type)
  }
  
  return (
    <div className="flex flex-col gap-2">
      {/* Like */}
      <button
        onClick={(e) => { e.stopPropagation(); handleReaction(REACTION_TYPES.LIKE) }}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          reactions.userReaction === REACTION_TYPES.LIKE
            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
            : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20'
        }`}
        title="Like"
      >
        <Heart className={`w-5 h-5 ${reactions.userReaction === REACTION_TYPES.LIKE ? 'fill-current' : ''}`} />
        {reactions.like > 0 && <span className="text-xs">{formatReactionCount(reactions.like)}</span>}
      </button>
      
      {/* Funny */}
      <button
        onClick={(e) => { e.stopPropagation(); handleReaction(REACTION_TYPES.FUNNY) }}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          reactions.userReaction === REACTION_TYPES.FUNNY
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
            : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20'
        }`}
        title="Funny"
      >
        <span className="text-lg">😂</span>
        {reactions.funny > 0 && <span className="text-xs">{formatReactionCount(reactions.funny)}</span>}
      </button>
      
      {/* Fire */}
      <button
        onClick={(e) => { e.stopPropagation(); handleReaction(REACTION_TYPES.FIRE) }}
        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
          reactions.userReaction === REACTION_TYPES.FIRE
            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
            : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20'
        }`}
        title="Fire"
      >
        <span className="text-lg">🔥</span>
        {reactions.fire > 0 && <span className="text-xs">{formatReactionCount(reactions.fire)}</span>}
      </button>
    </div>
  )
}

// Generate caption for content reels
function generateContentCaption(reel) {
  switch (reel.type) {
    case FEED_TYPES.THINK:
      return reel.summary?.slice(0, 80) + (reel.summary?.length > 80 ? '...' : '') || ''
    case FEED_TYPES.TAROT:
      return `Tarot pull: ${reel.metadata?.cardNames || reel.title}`
    case FEED_TYPES.HOROSCOPE:
      const sign = reel.metadata?.sign
      const lucky = reel.metadata?.luckyNumber
      return `${sign?.symbol || ''} ${sign?.name || ''} reading${lucky ? ` • Lucky ${lucky}` : ''}`
    case FEED_TYPES.THINKING:
      return `Challenge: ${reel.title} • ${reel.metadata?.difficulty || 'medium'}`
    default:
      return reel.title || ''
  }
}

// Local Mode Banner Component
function LocalModeBanner() {
  return (
    <div className="absolute top-16 left-4 md:top-6 md:left-auto md:right-32 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-medium">
      <Info className="w-3 h-3" />
      <span>Local mode — videos are session-only</span>
    </div>
  )
}

// Video Reel Card Component
function VideoReelCard({ reel, isActive, objectUrl, onSaveToggle, onRelink, onDelete, isMuted, onMuteToggle, isSupabaseMode, onReact }) {
  const config = getReelConfig(reel.type)
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showControls, setShowControls] = useState(true)

  // Determine the video URL to use
  // In Supabase mode: use signedUrl from the reel data
  // In local mode: use the passed objectUrl from state
  const videoUrl = isSupabaseMode ? reel.signedUrl : objectUrl

  useEffect(() => {
    setSaved(isSaved(reel.type, reel.id))
  }, [reel.type, reel.id])

  // Auto-play/pause based on active state
  useEffect(() => {
    if (!videoRef.current || !videoUrl) return

    if (isActive) {
      videoRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch(() => {
        setIsPlaying(false)
      })
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }, [isActive, videoUrl])

  // Update muted state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted
    }
  }, [isMuted])

  const togglePlayPause = () => {
    if (!videoRef.current || !videoUrl) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

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

  // Only show re-link in local mode when video needs it
  const needsRelink = !isSupabaseMode && reel.metadata?.needsRelink && !objectUrl

  // Hide controls after 3 seconds of no interaction
  useEffect(() => {
    if (!isActive) return
    setShowControls(true)
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [isActive])

  return (
    <div 
      className="h-full w-full flex items-center justify-center p-4 md:p-8"
      onMouseMove={() => setShowControls(true)}
      onClick={togglePlayPause}
    >
      <div className="relative w-full max-w-lg h-full max-h-[600px] flex flex-col">
        {/* Video Container */}
        <div className={`flex-1 rounded-3xl bg-black border ${config.borderAccent} shadow-2xl overflow-hidden relative`}>
          {videoUrl ? (
            <>
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain bg-black"
                autoPlay={isActive}
                loop
                muted={isMuted}
                playsInline
              />
              
              {/* Play/Pause Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Caption Overlay (always visible when caption exists) */}
              {reel.metadata?.caption && (
                <div className="absolute bottom-16 left-0 right-0 px-4">
                  <p className="text-white text-sm leading-relaxed drop-shadow-lg bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2">
                    {reel.metadata.caption}
                  </p>
                </div>
              )}

              {/* Video Info Overlay */}
              <div className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Film className={`w-4 h-4 ${config.accentColor}`} />
                  <span className={`text-sm font-semibold ${config.accentColor}`}>Video Reel</span>
                  {isSupabaseMode && (
                    <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded-full">☁️ Cloud</span>
                  )}
                </div>
                <h3 className="text-white font-medium truncate">{reel.title}</h3>
                <p className="text-white/60 text-sm">{formatDuration(reel.metadata?.duration)}</p>
              </div>

              {/* Mute Button */}
              <button
                onClick={(e) => { e.stopPropagation(); onMuteToggle?.(); }}
                className={`absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </>
          ) : needsRelink ? (
            // Needs Relink State (only in local mode)
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Video needs re-linking</h3>
              <p className="text-gray-400 text-sm mb-4">{reel.title}</p>
              <button
                onClick={(e) => { e.stopPropagation(); onRelink?.(reel.id); }}
                className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 text-sm font-medium hover:bg-amber-500/30 transition-colors"
              >
                Re-link File
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(reel.id, reel.metadata?.storagePath); }}
                className="mt-2 px-4 py-2 rounded-lg text-red-400 text-sm hover:bg-red-500/10 transition-colors"
              >
                Delete
              </button>
            </div>
          ) : (
            // No video available (loading or error)
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center">
                <Film className="w-8 h-8 text-gray-600" />
              </div>
            </div>
          )}
        </div>

        {/* Action Rail (Right side) - Desktop */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+16px)] hidden md:flex flex-col gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              saved 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20'
            }`}
            title={saved ? 'Remove from saved' : 'Save'}
          >
            <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onMuteToggle?.(); }}
            className="w-12 h-12 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); handleShare(); }}
            className="w-12 h-12 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Reactions */}
          <ReactionButtons reelId={reel.id} onReact={onReact} />

          {/* Delete button for videos */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(reel.id, reel.metadata?.storagePath); }}
            className="w-12 h-12 rounded-full bg-white/10 text-red-400/70 hover:text-red-400 hover:bg-red-500/20 border border-white/20 flex items-center justify-center transition-all"
            title="Delete"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="md:hidden flex items-center justify-center gap-4 mt-4">
          <button
            onClick={(e) => { e.stopPropagation(); handleSave(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
              saved 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                : 'bg-white/10 text-white/70 border border-white/20'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
            <span className="text-sm">{saved ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onMuteToggle?.(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 border border-white/20"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete?.(reel.id, reel.metadata?.storagePath); }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-red-400/70 border border-white/20"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Content Reel Card Component (existing card type)
function ContentReelCard({ reel, isActive, onSaveToggle, onReact }) {
  const config = getReelConfig(reel.type)
  const Icon = TYPE_ICONS[reel.type]
  const [saved, setSaved] = useState(false)
  const caption = generateContentCaption(reel)

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

          {reel.linkTo && (
            <Link
              href={reel.linkTo}
              className="w-12 h-12 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
              title="Open"
            >
              <ExternalLink className="w-5 h-5" />
            </Link>
          )}

          <button
            onClick={handleShare}
            className="w-12 h-12 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* Reactions */}
          <ReactionButtons reelId={reel.id} onReact={onReact} />
        </div>

        {/* Caption Badge (bottom of card) */}
        {caption && (
          <div className="absolute bottom-20 left-4 right-4 md:left-0 md:right-auto md:max-w-[300px]">
            <p className="text-white/80 text-sm bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2">
              {caption}
            </p>
          </div>
        )}

        {/* Mobile Actions */}
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

          {reel.linkTo && (
            <Link
              href={reel.linkTo}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white/70 border border-white/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">Open</span>
            </Link>
          )}

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

function EmptyState({ onUploadClick, onRecordClick }) {
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
        <p className="text-gray-400 mb-6">
          Record or upload a video to create your first reel.
        </p>
        
        {/* Record/Upload Buttons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button
            onClick={onRecordClick}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors"
          >
            <Video className="w-5 h-5" />
            Record Video
          </button>
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            <Upload className="w-5 h-5" />
            Upload Video
          </button>
        </div>
        
        <p className="text-gray-500 text-sm mb-4">Or create content:</p>
        
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

function ErrorState({ error, onRetry }) {
  return (
    <div className="h-full w-full flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Failed to load reels</h2>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}

// Upload Modal Component
function UploadModal({ isOpen, onClose, onUpload }) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null) // 'uploading' | 'saving' | 'complete'
  const [selectedFile, setSelectedFile] = useState(null)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelected = (file) => {
    setError(null)
    
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }
    
    setSelectedFile(file)
  }

  const handleUploadConfirm = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setUploadProgress('processing')

    try {
      const metadata = await extractVideoMetadata(selectedFile)
      
      // Use the unified uploadVideo function (handles Supabase or localStorage)
      const result = await uploadVideo(
        selectedFile,
        { ...metadata, fileName: selectedFile.name, fileType: selectedFile.type, source: 'uploaded', caption: caption.trim() },
        setUploadProgress
      )

      if (result.error) {
        setError(result.error)
        setIsUploading(false)
        setUploadProgress(null)
        return
      }

      onUpload({ 
        entry: result.entry, 
        objectUrl: result.objectUrl,
        isSupabaseMode: result.isSupabaseMode 
      })
      handleClose()
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to process video. Please try again.')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setCaption('')
    setError(null)
    onClose()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelected(file)
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelected(file)
  }

  const getProgressText = () => {
    switch (uploadProgress) {
      case 'processing': return 'Processing video...'
      case 'uploading': return 'Uploading to cloud...'
      case 'saving': return 'Saving metadata...'
      case 'complete': return 'Complete!'
      default: return 'Processing...'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-2">Upload Video</h2>
        <p className="text-gray-400 text-sm mb-6">
          {selectedFile 
            ? `Selected: ${selectedFile.name}` 
            : `Upload a video to create a reel. Max ${MAX_FILE_SIZE_MB}MB. Supported: ${ACCEPTED_EXTENSIONS.join(', ')}`
          }
        </p>

        {!selectedFile ? (
          /* Drop Zone */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging 
                ? 'border-pink-500 bg-pink-500/10 cursor-pointer' 
                : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 cursor-pointer'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="text-white font-medium mb-1">Drop video here or click to browse</p>
            <p className="text-gray-500 text-sm">MP4, WebM, or MOV up to {MAX_FILE_SIZE_MB}MB</p>
          </div>
        ) : isUploading ? (
          /* Uploading State */
          <div className="border-2 border-dashed rounded-xl p-8 text-center border-gray-700 bg-gray-800/30">
            <Loader2 className="w-10 h-10 text-pink-500 animate-spin mx-auto mb-3" />
            <p className="text-white font-medium mb-1">{getProgressText()}</p>
            <p className="text-gray-500 text-sm">Please wait...</p>
          </div>
        ) : (
          /* Caption Input */
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
              <Film className="w-8 h-8 text-pink-400" />
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{selectedFile.name}</p>
                <p className="text-gray-500 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="p-1 rounded text-gray-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Caption <span className="text-gray-600">(optional, max 120 chars)</span>
              </label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value.slice(0, 120))}
                placeholder="Add a caption to your video..."
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
              />
              <p className="text-xs text-gray-600 mt-1 text-right">{caption.length}/120</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          {selectedFile && !isUploading && (
            <button
              onClick={handleUploadConfirm}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium hover:opacity-90"
            >
              Upload
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// Relink Modal Component
function RelinkModal({ isOpen, videoId, fileName, onClose, onRelink }) {
  const fileInputRef = useRef(null)
  const [error, setError] = useState(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateVideoFile(file)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    const objectUrl = URL.createObjectURL(file)
    markVideoAsRelinked(videoId)
    onRelink(videoId, objectUrl)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 p-6">
        <h2 className="text-xl font-bold text-white mb-2">Re-link Video</h2>
        <p className="text-gray-400 text-sm mb-4">
          Select the original video file to continue playback.
        </p>
        <p className="text-amber-400 text-sm mb-6">
          Looking for: <span className="font-medium">{fileName}</span>
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          onChange={handleFileSelect}
          className="hidden"
        />

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-medium hover:bg-amber-500/30 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Select File
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// Recording Modal Component
function RecordModal({ isOpen, onClose, onRecorded }) {
  const [stage, setStage] = useState('setup') // setup | recording | preview
  const [error, setError] = useState(null)
  const [stream, setStream] = useState(null)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [recordedUrl, setRecordedUrl] = useState(null)
  const [timer, setTimer] = useState(0)
  const [isMicEnabled, setIsMicEnabled] = useState(true)
  const [videoDevices, setVideoDevices] = useState([])
  const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0)
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveProgress, setSaveProgress] = useState(null)
  const [caption, setCaption] = useState('')
  
  const videoRef = useRef(null)
  const previewVideoRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerIntervalRef = useRef(null)
  const streamRef = useRef(null)

  // Check for MediaRecorder support
  const isSupported = isMediaRecorderSupported()

  // Initialize camera
  const initCamera = useCallback(async (deviceId = null) => {
    try {
      // Stop existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }

      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: isMicEnabled
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = newStream
      setStream(newStream)
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
      }

      // Get available devices
      const devices = await getVideoDevices()
      setVideoDevices(devices)
      
      setError(null)
      setStage('setup')
    } catch (err) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access to record.')
      } else if (err.name === 'NotFoundError') {
        setError('No camera found. Please connect a camera to record.')
      } else {
        setError('Failed to access camera. Please try again.')
      }
    }
  }, [isMicEnabled])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
    }
    setStream(null)
    setIsRecording(false)
    setRecordedBlob(null)
    setRecordedUrl(null)
    setTimer(0)
    setStage('setup')
    chunksRef.current = []
  }, [])

  // Initialize on open
  useEffect(() => {
    if (isOpen && isSupported) {
      initCamera()
    }
    return () => {
      cleanup()
    }
  }, [isOpen, isSupported, initCamera, cleanup])

  // Update audio track when mic toggle changes
  useEffect(() => {
    if (stream && !isRecording) {
      const audioTracks = stream.getAudioTracks()
      audioTracks.forEach(track => {
        track.enabled = isMicEnabled
      })
    }
  }, [isMicEnabled, stream, isRecording])

  // Start recording
  const startRecording = () => {
    if (!stream) return

    chunksRef.current = []
    
    const options = { mimeType: 'video/webm;codecs=vp9,opus' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm'
    }

    try {
      const recorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        const url = URL.createObjectURL(blob)
        setRecordedBlob(blob)
        setRecordedUrl(url)
        setStage('preview')
        
        // Stop the camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop())
        }
      }

      recorder.start(1000) // Collect data every second
      setIsRecording(true)
      setStage('recording')
      setTimer(0)

      // Start timer
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev >= MAX_RECORDING_DURATION - 1) {
            stopRecording()
            return MAX_RECORDING_DURATION
          }
          return prev + 1
        })
      }, 1000)
    } catch (err) {
      setError('Failed to start recording. Please try again.')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }

  // Switch camera
  const switchCamera = async () => {
    if (videoDevices.length <= 1) return
    
    const nextIndex = (currentDeviceIndex + 1) % videoDevices.length
    setCurrentDeviceIndex(nextIndex)
    await initCamera(videoDevices[nextIndex].deviceId)
  }

  // Accept recording
  const acceptRecording = async () => {
    if (!recordedBlob) return

    setIsSaving(true)
    setSaveProgress('processing')

    try {
      // Get duration from preview video
      const duration = previewVideoRef.current?.duration || timer

      // Use the unified uploadVideo function
      const result = await uploadVideo(
        recordedBlob,
        { duration, width: 0, height: 0, source: 'recorded', caption: caption.trim() },
        setSaveProgress
      )

      if (result.error) {
        setError(result.error)
        setIsSaving(false)
        setSaveProgress(null)
        return
      }

      onRecorded({ 
        entry: result.entry, 
        objectUrl: result.objectUrl,
        isSupabaseMode: result.isSupabaseMode 
      })
      
      setRecordedUrl(null) // Don't revoke if local mode, it's being used
      setCaption('')
      onClose()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save recording. Please try again.')
    } finally {
      setIsSaving(false)
      setSaveProgress(null)
    }
  }

  // Discard recording
  const discardRecording = () => {
    if (recordedUrl) {
      URL.revokeObjectURL(recordedUrl)
    }
    setRecordedBlob(null)
    setRecordedUrl(null)
    setTimer(0)
    setCaption('')
    initCamera()
  }

  // Toggle preview playback
  const togglePreviewPlay = () => {
    if (!previewVideoRef.current) return
    
    if (isPreviewPlaying) {
      previewVideoRef.current.pause()
    } else {
      previewVideoRef.current.play()
    }
    setIsPreviewPlaying(!isPreviewPlaying)
  }

  // Handle close
  const handleClose = () => {
    cleanup()
    onClose()
  }

  // Format timer
  const formatTimer = (secs) => {
    const mins = Math.floor(secs / 60)
    const seconds = secs % 60
    return `${mins}:${seconds.toString().padStart(2, '0')}`
  }

  const getSaveProgressText = () => {
    switch (saveProgress) {
      case 'processing': return 'Processing...'
      case 'uploading': return 'Uploading to cloud...'
      case 'saving': return 'Saving...'
      case 'complete': return 'Complete!'
      default: return 'Saving...'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">
            {stage === 'setup' && 'Record Video'}
            {stage === 'recording' && 'Recording...'}
            {stage === 'preview' && 'Preview'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative">
          {!isSupported ? (
            // Not supported state
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Recording not supported</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your browser does not support video recording. Please use Upload Video instead.
              </p>
              <button
                onClick={handleClose}
                className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          ) : error ? (
            // Error state
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">Camera Error</h3>
              <p className="text-gray-400 text-sm mb-4">{error}</p>
              <button
                onClick={() => initCamera()}
                className="px-4 py-2 rounded-lg bg-pink-500 text-white hover:bg-pink-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : stage === 'preview' ? (
            // Preview stage
            <div>
              <div className="relative aspect-[9/16] max-h-[350px] bg-black" onClick={togglePreviewPlay}>
                <video
                  ref={previewVideoRef}
                  src={recordedUrl}
                  className="w-full h-full object-contain"
                  loop
                  playsInline
                  onPlay={() => setIsPreviewPlaying(true)}
                  onPause={() => setIsPreviewPlaying(false)}
                />
                {!isPreviewPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                )}
                {/* Duration badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 text-white text-sm font-medium">
                  {formatTimer(timer)}
                </div>
              </div>
              {/* Caption Input */}
              <div className="p-4 border-t border-gray-800">
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Caption <span className="text-gray-600">(optional, max 120 chars)</span>
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value.slice(0, 120))}
                  placeholder="Add a caption to your video..."
                  className="w-full px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 text-sm"
                  onClick={(e) => e.stopPropagation()}
                />
                <p className="text-xs text-gray-600 mt-1 text-right">{caption.length}/120</p>
              </div>
            </div>
          ) : (
            // Setup/Recording stage - Live preview
            <div className="relative aspect-[9/16] max-h-[400px] bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              
              {/* Timer overlay */}
              {stage === 'recording' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/90 text-white">
                  <Circle className="w-3 h-3 fill-current animate-pulse" />
                  <span className="font-mono font-bold">{formatTimer(timer)}</span>
                  <span className="text-xs text-white/70">/ {formatTimer(MAX_RECORDING_DURATION)}</span>
                </div>
              )}

              {/* Controls overlay */}
              {stage === 'setup' && (
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  {/* Mic toggle */}
                  <button
                    onClick={() => setIsMicEnabled(!isMicEnabled)}
                    className={`p-3 rounded-full transition-colors ${
                      isMicEnabled 
                        ? 'bg-white/20 text-white' 
                        : 'bg-red-500/80 text-white'
                    }`}
                  >
                    {isMicEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>

                  {/* Switch camera */}
                  {videoDevices.length > 1 && (
                    <button
                      onClick={switchCamera}
                      className="p-3 rounded-full bg-white/20 text-white"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-800">
          {stage === 'setup' && !error && isSupported && (
            <button
              onClick={startRecording}
              disabled={!stream}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Circle className="w-5 h-5 fill-current" />
              Start Recording
            </button>
          )}

          {stage === 'recording' && (
            <button
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700 transition-colors"
            >
              <Square className="w-5 h-5 fill-current" />
              Stop Recording
            </button>
          )}

          {stage === 'preview' && (
            <div className="flex gap-3">
              <button
                onClick={discardRecording}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Discard
              </button>
              <button
                onClick={acceptRecording}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {getSaveProgressText()}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save to Reels
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReelsPage() {
  const { toast } = useToast()
  const [reels, setReels] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [mounted, setMounted] = useState(false)
  const [isSupabaseMode, setIsSupabaseMode] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showRecordModal, setShowRecordModal] = useState(false)
  const [showRelinkModal, setShowRelinkModal] = useState(false)
  const [relinkTarget, setRelinkTarget] = useState(null)
  const [videoObjectUrls, setVideoObjectUrls] = useState({}) // id -> objectUrl (for local mode)
  const [isMuted, setIsMuted] = useState(true)
  const containerRef = useRef(null)

  // Load reels function
  const loadReels = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    
    try {
      const result = await getAllReelItems(50)
      setReels(result.reels)
      setIsSupabaseMode(result.isSupabaseMode)
    } catch (error) {
      console.error('Failed to load reels:', error)
      setLoadError('Failed to load reels. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setMounted(true)
    // Only mark as needing relink in local mode (checked later)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Mark videos as needing relink ONLY if not in Supabase mode
    // We do this after loading to know the mode
    loadReels().then(() => {
      // After loading, if NOT in Supabase mode, mark for relink
      // This is handled inside the loadReels result
    })
  }, [mounted, loadReels])

  // After we know the mode, mark for relink if local
  useEffect(() => {
    if (!mounted || isLoading) return
    
    if (!isSupabaseMode) {
      markVideosAsNeedingRelink()
      // Reload to get updated needsRelink flags
      loadReels()
    }
  }, [mounted, isSupabaseMode, isLoading]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      Object.values(videoObjectUrls).forEach(url => {
        URL.revokeObjectURL(url)
      })
    }
  }, [videoObjectUrls])

  // Keyboard navigation
  useEffect(() => {
    if (!mounted || reels.length === 0) return

    const handleKeyDown = (e) => {
      const currentReel = reels[currentIndex]
      
      if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault()
        setCurrentIndex(prev => Math.min(prev + 1, reels.length - 1))
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault()
        setCurrentIndex(prev => Math.max(prev - 1, 0))
      } else if (e.key === ' ' && currentReel?.isVideo) {
        // Space: play/pause video
        e.preventDefault()
        // The VideoReelCard handles this internally via click
      } else if (e.key === 'm' || e.key === 'M') {
        // M: mute/unmute
        if (currentReel?.isVideo) {
          e.preventDefault()
          setIsMuted(prev => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mounted, reels, currentIndex])

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

  const handleReaction = (added, type) => {
    const emoji = REACTION_EMOJIS[type]
    toast({ 
      type: 'info', 
      message: added ? `Reacted ${emoji}` : 'Reaction removed' 
    })
  }

  const handleUpload = ({ entry, objectUrl, isSupabaseMode: uploadMode }) => {
    // In local mode, store the objectUrl for playback
    if (!uploadMode && objectUrl) {
      setVideoObjectUrls(prev => ({ ...prev, [entry.id]: objectUrl }))
    }
    
    // Reload reels
    loadReels().then(() => {
      setCurrentIndex(0) // Go to the new video
    })
    
    const modeText = uploadMode ? '☁️ Uploaded to cloud!' : 'Video added!'
    toast({ type: 'success', message: modeText })
  }

  const handleRecorded = ({ entry, objectUrl, isSupabaseMode: recordMode }) => {
    // In local mode, store the objectUrl for playback
    if (!recordMode && objectUrl) {
      setVideoObjectUrls(prev => ({ ...prev, [entry.id]: objectUrl }))
    }
    
    // Reload reels
    loadReels().then(() => {
      setCurrentIndex(0) // Go to the new recorded video
    })
    
    const modeText = recordMode ? '☁️ Recorded & saved to cloud!' : 'Recorded reel added ✓'
    toast({ type: 'success', message: modeText })
  }

  const handleRelink = (videoId, objectUrl) => {
    setVideoObjectUrls(prev => ({ ...prev, [videoId]: objectUrl }))
    setShowRelinkModal(false)
    setRelinkTarget(null)
    toast({ type: 'success', message: 'Video re-linked!' })
    
    // Reload to update the needsRelink flag
    loadReels()
  }

  const handleRelinkRequest = (videoId) => {
    const video = reels.find(r => r.id === videoId)
    setRelinkTarget({ id: videoId, fileName: video?.title || 'video' })
    setShowRelinkModal(true)
  }

  const handleDelete = async (videoId, storagePath) => {
    const success = await deleteVideo(videoId, storagePath, isSupabaseMode)
    
    if (!success && isSupabaseMode) {
      toast({ type: 'error', message: 'Failed to delete video' })
      return
    }

    // Revoke object URL if exists (local mode)
    if (videoObjectUrls[videoId]) {
      URL.revokeObjectURL(videoObjectUrls[videoId])
      setVideoObjectUrls(prev => {
        const updated = { ...prev }
        delete updated[videoId]
        return updated
      })
    }
    
    // Reload reels
    loadReels().then(() => {
      if (currentIndex >= reels.length - 1) {
        setCurrentIndex(Math.max(0, reels.length - 2))
      }
    })
    
    toast({ type: 'info', message: 'Video deleted' })
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
      {/* Local Mode Banner */}
      {!isSupabaseMode && !isLoading && (
        <LocalModeBanner />
      )}

      {isLoading ? (
        <LoadingState />
      ) : loadError ? (
        <ErrorState error={loadError} onRetry={loadReels} />
      ) : !hasReels ? (
        <EmptyState onUploadClick={() => setShowUploadModal(true)} onRecordClick={() => setShowRecordModal(true)} />
      ) : (
        <>
          {/* Upload/Record Buttons */}
          <div className="absolute top-4 left-4 md:top-6 md:left-6 z-10 flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden md:inline">Upload</span>
            </button>
            <button
              onClick={() => setShowRecordModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
            >
              <Video className="w-4 h-4" />
              <span className="hidden md:inline">Record</span>
            </button>
          </div>

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
                {reel.isVideo ? (
                  <VideoReelCard
                    reel={reel}
                    isActive={index === currentIndex}
                    objectUrl={videoObjectUrls[reel.id]}
                    onSaveToggle={handleSaveToggle}
                    onRelink={handleRelinkRequest}
                    onDelete={handleDelete}
                    isMuted={isMuted}
                    onMuteToggle={() => setIsMuted(!isMuted)}
                    isSupabaseMode={isSupabaseMode}
                    onReact={handleReaction}
                  />
                ) : (
                  <ContentReelCard
                    reel={reel}
                    isActive={index === currentIndex}
                    onSaveToggle={handleSaveToggle}
                    onReact={handleReaction}
                  />
                )}
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
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 mx-1">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 mx-1">↓</kbd> navigate
            {reels[currentIndex]?.isVideo && (
              <>
                <span className="mx-2">|</span>
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 mx-1">Space</kbd> play/pause
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 mx-1">M</kbd> mute
              </>
            )}
          </div>
        </>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUpload={handleUpload}
      />

      {/* Record Modal */}
      <RecordModal
        isOpen={showRecordModal}
        onClose={() => setShowRecordModal(false)}
        onRecorded={handleRecorded}
      />

      {/* Relink Modal */}
      <RelinkModal
        isOpen={showRelinkModal}
        videoId={relinkTarget?.id}
        fileName={relinkTarget?.fileName}
        onClose={() => { setShowRelinkModal(false); setRelinkTarget(null); }}
        onRelink={handleRelink}
      />
    </div>
  )
}
