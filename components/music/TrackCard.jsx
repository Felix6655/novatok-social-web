'use client'

import { Heart, Play, Pause, MoreHorizontal } from 'lucide-react'
import { formatDuration, formatPlays } from '@/lib/music/data'
import { getGradientCSS, getTrackArtworkSVG } from '@/lib/music/artwork'

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
  
  const gradientCSS = getGradientCSS(track.id, 'track')
  const artworkSVG = getTrackArtworkSVG(track.id, 200)
  
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
        <div 
          className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 relative overflow-hidden"
          style={{ background: gradientCSS }}
        >
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
      {/* Album Art with Generated Artwork */}
      <div 
        className="aspect-square rounded-lg mb-3 relative overflow-hidden cursor-pointer"
        style={{ backgroundImage: `url("${artworkSVG}")`, backgroundSize: 'cover' }}
        onClick={handlePlayPause}
      >
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
        
        {/* Playing indicator */}
        {isCurrentTrack && isPlaying && (
          <div className="absolute bottom-2 right-2">
            <div className="flex items-end gap-0.5 h-4">
              <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '40%' }} />
              <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '80%', animationDelay: '0.1s' }} />
              <div className="w-1 bg-white rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0.2s' }} />
            </div>
          </div>
        )}
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
