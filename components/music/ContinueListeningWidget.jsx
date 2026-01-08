'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Play, ChevronRight, Music } from 'lucide-react'
import { getRecentTracks } from '@/lib/music/player'
import { getTrackById, formatDuration } from '@/lib/music/data'
import { getGradientCSS, getTrackArtworkSVG } from '@/lib/music/artwork'

export default function ContinueListeningWidget({ onPlayTrack, maxItems = 8 }) {
  const [recentTracks, setRecentTracks] = useState([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const recentIds = getRecentTracks()
    const tracks = recentIds
      .map(id => getTrackById(id))
      .filter(Boolean)
      .slice(0, maxItems)
    setRecentTracks(tracks)
  }, [maxItems])

  if (!mounted || recentTracks.length === 0) {
    return null
  }

  return (
    <div className="bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <Music className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-white">Continue Listening</h3>
        </div>
        <Link 
          href="/music" 
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-400 transition-colors"
        >
          See all
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Horizontal scroll container */}
      <div className="p-3">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recentTracks.map((track) => {
            const artworkSVG = getTrackArtworkSVG(track.id, 120)
            
            return (
              <button
                key={track.id}
                onClick={() => onPlayTrack?.(track)}
                className="flex-shrink-0 group relative"
              >
                {/* Album art */}
                <div 
                  className="w-24 h-24 rounded-lg overflow-hidden relative"
                  style={{ backgroundImage: `url("${artworkSVG}")`, backgroundSize: 'cover' }}
                >
                  {/* Hover overlay with play button */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <Play className="w-5 h-5 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
                
                {/* Track info */}
                <div className="mt-2 text-left w-24">
                  <p className="text-xs font-medium text-white truncate">{track.title}</p>
                  <p className="text-[10px] text-gray-500 truncate">{track.artist}</p>
                </div>
                
                {/* Resume badge */}
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-purple-500/90 text-[9px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  Resume
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
