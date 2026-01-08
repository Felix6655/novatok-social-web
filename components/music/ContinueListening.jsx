'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, Pause, Music } from 'lucide-react'
import { getPlayerState } from '@/lib/music/player'
import { getTrackById, formatDuration } from '@/lib/music/data'
import { getGradientCSS } from '@/lib/music/artwork'

/**
 * Continue Listening Widget for Home Page
 * Shows the last played track with resume functionality
 */
export default function ContinueListening({ onPlay, onPause, isPlaying, currentTrackId }) {
  const [lastTrack, setLastTrack] = useState(null)
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
    const state = getPlayerState()
    if (state?.currentTrackId) {
      const track = getTrackById(state.currentTrackId)
      setLastTrack(track)
    }
  }, [])
  
  // Don't render if no last track
  if (!mounted || !lastTrack) return null
  
  const isCurrentlyPlaying = isPlaying && currentTrackId === lastTrack.id
  const gradientCSS = getGradientCSS(lastTrack.id, 'track')
  
  const handleClick = () => {
    if (isCurrentlyPlaying) {
      onPause?.()
    } else {
      onPlay?.(lastTrack)
    }
  }
  
  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800 p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-gray-300">Continue Listening</span>
        </div>
        <Link href="/music" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          Open Music
        </Link>
      </div>
      
      <div 
        className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 cursor-pointer transition-colors"
        onClick={handleClick}
      >
        {/* Album Art */}
        <div 
          className="w-14 h-14 rounded-lg flex-shrink-0 relative overflow-hidden"
          style={{ background: gradientCSS }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/30 text-lg font-bold">{lastTrack.title.charAt(0)}</span>
          </div>
          
          {/* Play/Pause overlay */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            {isCurrentlyPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-0.5" />
            )}
          </div>
          
          {/* Playing indicator */}
          {isCurrentlyPlaying && (
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
          <h4 className="text-sm font-medium text-white truncate">{lastTrack.title}</h4>
          <p className="text-xs text-gray-500 truncate">{lastTrack.artist}</p>
        </div>
        
        {/* Duration */}
        <div className="flex-shrink-0">
          <span className="text-xs text-gray-500">{formatDuration(lastTrack.duration)}</span>
        </div>
        
        {/* Play Button */}
        <button 
          className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-400 flex items-center justify-center transition-colors flex-shrink-0"
          onClick={(e) => { e.stopPropagation(); handleClick(); }}
        >
          {isCurrentlyPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>
      </div>
    </div>
  )
}
