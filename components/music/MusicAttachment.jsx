'use client'

import { useState } from 'react'
import { Play, Pause, X } from 'lucide-react'
import { formatDuration } from '@/lib/music/data'
import { getGradientCSS } from '@/lib/music/artwork'

/**
 * Music Attachment Component for Think posts
 * Shows attached track with playback controls
 */
export default function MusicAttachment({ track, onPlay, onPause, isPlaying, isCurrentTrack, onRemove, showRemove = false }) {
  if (!track) return null
  
  const isThisPlaying = isPlaying && isCurrentTrack
  const gradientCSS = getGradientCSS(track.id, 'track')
  
  const handlePlayPause = (e) => {
    e.stopPropagation()
    if (isThisPlaying) {
      onPause?.()
    } else {
      onPlay?.(track)
    }
  }
  
  return (
    <div className="relative bg-gray-800/30 rounded-lg p-3 border border-gray-700/50">
      {showRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center transition-colors z-10"
        >
          <X className="w-3 h-3 text-gray-300" />
        </button>
      )}
      
      <div className="flex items-center gap-3">
        {/* Album Art with Play Button */}
        <div 
          className="w-14 h-14 rounded-lg flex-shrink-0 relative overflow-hidden cursor-pointer"
          style={{ background: gradientCSS }}
          onClick={handlePlayPause}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/30 text-lg font-bold">{track.title.charAt(0)}</span>
          </div>
          
          {/* Play/Pause overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              {isThisPlaying ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" />
              )}
            </div>
          </div>
          
          {/* Playing indicator */}
          {isThisPlaying && (
            <div className="absolute bottom-1 right-1">
              <div className="flex items-end gap-0.5 h-3">
                <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '40%' }} />
                <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '70%', animationDelay: '0.1s' }} />
                <div className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '50%', animationDelay: '0.2s' }} />
              </div>
            </div>
          )}
        </div>
        
        {/* Track Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isThisPlaying ? 'text-purple-400' : 'text-white'}`}>
            {track.title}
          </p>
          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
          <p className="text-[10px] text-gray-600 mt-1">{track.album} · {formatDuration(track.duration)}</p>
        </div>
      </div>
    </div>
  )
}
