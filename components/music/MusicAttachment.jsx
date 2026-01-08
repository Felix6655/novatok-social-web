'use client'

import { Play, X, Music2 } from 'lucide-react'
import { formatDuration } from '@/lib/music/data'
import { getGradientCSS, getTrackArtworkSVG } from '@/lib/music/artwork'

// Compact attachment display for Think posts
export function MusicAttachmentPreview({ track, onRemove, onPlay }) {
  if (!track) return null
  
  const artworkSVG = getTrackArtworkSVG(track.id, 80)
  
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-800/50 rounded-lg border border-gray-700/50 group">
      {/* Album art */}
      <div 
        className="w-12 h-12 rounded-md overflow-hidden relative flex-shrink-0 cursor-pointer"
        style={{ backgroundImage: `url("${artworkSVG}")`, backgroundSize: 'cover' }}
        onClick={() => onPlay?.(track)}
      >
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-5 h-5 text-white ml-0.5" />
        </div>
      </div>
      
      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Music2 className="w-3 h-3 text-purple-400 flex-shrink-0" />
          <p className="text-sm font-medium text-white truncate">{track.title}</p>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {track.artist} • {formatDuration(track.duration)}
        </p>
      </div>
      
      {/* Remove button */}
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-gray-700/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

// Display version for viewing saved thoughts (read-only)
export function MusicAttachmentDisplay({ track, onPlay }) {
  if (!track) return null
  
  const artworkSVG = getTrackArtworkSVG(track.id, 60)
  
  return (
    <button
      onClick={() => onPlay?.(track)}
      className="flex items-center gap-2.5 p-2 bg-purple-500/10 rounded-lg border border-purple-500/20 hover:bg-purple-500/20 transition-colors group w-full text-left"
    >
      {/* Album art */}
      <div 
        className="w-10 h-10 rounded-md overflow-hidden relative flex-shrink-0"
        style={{ backgroundImage: `url("${artworkSVG}")`, backgroundSize: 'cover' }}
      >
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-4 h-4 text-white ml-0.5" />
        </div>
      </div>
      
      {/* Track info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-purple-300 truncate">{track.title}</p>
        <p className="text-xs text-gray-500 truncate">{track.artist}</p>
      </div>
      
      {/* Play indicator */}
      <div className="flex items-center gap-1 text-[10px] text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
        <Play className="w-3 h-3" />
        Play
      </div>
    </button>
  )
}

// Track selector modal/picker
export function MusicTrackPicker({ tracks, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[hsl(0,0%,7%)] rounded-xl border border-gray-800 w-full max-w-md max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <h3 className="text-sm font-semibold text-white">Attach a Track</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-gray-500 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Track list */}
        <div className="overflow-y-auto max-h-[calc(70vh-56px)]">
          {tracks.map((track) => {
            const artworkSVG = getTrackArtworkSVG(track.id, 60)
            
            return (
              <button
                key={track.id}
                onClick={() => {
                  onSelect(track)
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800/50 transition-colors text-left"
              >
                <div 
                  className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0"
                  style={{ backgroundImage: `url("${artworkSVG}")`, backgroundSize: 'cover' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{track.title}</p>
                  <p className="text-xs text-gray-500 truncate">{track.artist} • {formatDuration(track.duration)}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
