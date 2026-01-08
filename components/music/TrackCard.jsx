'use client'

import { Heart, Play, Pause, MoreHorizontal } from 'lucide-react'
import { formatDuration, formatPlays } from '@/lib/music/data'

export default function TrackCard({ 
  track, 
  isPlaying, 
  isCurrentTrack,
  isLiked,
  onPlay, 
  onPause,
  onLike,
  compact = false
}) {
  if (!track) return null
  
  const handlePlayPause = () => {
    if (isCurrentTrack && isPlaying) {
      onPause?.()
    } else {
      onPlay?.(track)
    }
  }
  
  if (compact) {
    return (
      <div 
        className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group cursor-pointer ${
          isCurrentTrack 
            ? 'bg-purple-500/10 border border-purple-500/20' 
            : 'hover:bg-gray-800/50'
        }`}
        onClick={handlePlayPause}
      >
        {/* Album Art */}
        <div className={`w-10 h-10 rounded-md bg-gradient-to-br ${track.coverGradient} flex items-center justify-center flex-shrink-0 relative overflow-hidden`}>
          <span className="text-white/80 text-xs font-bold">
            {track.title.charAt(0)}
          </span>
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
            isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}>
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </div>
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium truncate ${isCurrentTrack ? 'text-purple-400' : 'text-white'}`}>
            {track.title}
          </p>
          <p className="text-xs text-gray-500 truncate">{track.artist}</p>
        </div>
        
        {/* Duration */}
        <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
      </div>
    )
  }
  
  return (
    <div 
      className={`group relative bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-3 transition-all duration-200 ${
        isCurrentTrack ? 'ring-1 ring-purple-500/50' : ''
      }`}
    >
      {/* Album Art */}
      <div 
        className={`aspect-square rounded-lg bg-gradient-to-br ${track.coverGradient} mb-3 relative overflow-hidden cursor-pointer`}
        onClick={handlePlayPause}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/30 text-4xl font-bold">
            {track.title.charAt(0)}
          </span>
        </div>
        
        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
          isCurrentTrack ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            {isCurrentTrack && isPlaying ? (
              <Pause className="w-6 h-6 text-white" />
            ) : (
              <Play className="w-6 h-6 text-white ml-1" />
            )}
          </div>
        </div>
        
        {/* BPM badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] text-white/80">
          {track.bpm} BPM
        </div>
      </div>
      
      {/* Track Info */}
      <div className="space-y-1">
        <h3 className={`font-medium text-sm truncate ${isCurrentTrack ? 'text-purple-400' : 'text-white'}`}>
          {track.title}
        </h3>
        <p className="text-xs text-gray-500 truncate">{track.artist}</p>
        
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-gray-600">{formatPlays(track.plays)} plays</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={(e) => { e.stopPropagation(); onLike?.(track) }}
              className={`p-1.5 rounded-full transition-colors ${
                isLiked 
                  ? 'text-pink-500 hover:text-pink-400' 
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button className="p-1.5 rounded-full text-gray-500 hover:text-gray-300 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
