'use client'

import { Play, Users } from 'lucide-react'

export default function PlaylistCard({ playlist, onPlay }) {
  if (!playlist) return null
  
  return (
    <div 
      className="group relative bg-gray-800/30 hover:bg-gray-800/50 rounded-xl p-3 transition-all duration-200 cursor-pointer"
      onClick={() => onPlay?.(playlist)}
    >
      {/* Cover Art */}
      <div className={`aspect-square rounded-lg bg-gradient-to-br ${playlist.coverGradient} mb-3 relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-5xl">♫</span>
        </div>
        
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-6 h-6 text-white ml-1" />
          </div>
        </div>
        
        {/* Track count */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-[10px] text-white/80">
          {playlist.trackIds.length} tracks
        </div>
      </div>
      
      {/* Playlist Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm text-white truncate">{playlist.title}</h3>
        <p className="text-xs text-gray-500 truncate line-clamp-2">{playlist.description}</p>
        
        <div className="flex items-center gap-1 pt-1">
          <Users className="w-3 h-3 text-gray-600" />
          <span className="text-[10px] text-gray-600">{playlist.followers.toLocaleString()} followers</span>
        </div>
      </div>
    </div>
  )
}
