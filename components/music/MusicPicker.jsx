'use client'

import { useState, useEffect } from 'react'
import { Search, Music, X, Play, Heart, Clock } from 'lucide-react'
import { TRACKS, formatDuration } from '@/lib/music/data'
import { getLikedTracks, getRecentTracks, getTrackById } from '@/lib/music/player'
import { getGradientCSS } from '@/lib/music/artwork'

/**
 * Music Picker Modal for attaching music to Think posts
 */
export default function MusicPicker({ isOpen, onClose, onSelect, selectedTrack }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [likedTracks, setLikedTracks] = useState([])
  const [recentTracks, setRecentTracks] = useState([])
  
  useEffect(() => {
    if (isOpen) {
      setLikedTracks(getLikedTracks())
      setRecentTracks(getRecentTracks())
    }
  }, [isOpen])
  
  if (!isOpen) return null
  
  // Get tracks based on active tab
  let displayTracks = TRACKS
  if (activeTab === 'liked') {
    displayTracks = likedTracks.map(id => getTrackById(id)).filter(Boolean)
  } else if (activeTab === 'recent') {
    displayTracks = recentTracks.map(id => getTrackById(id)).filter(Boolean).slice(0, 10)
  }
  
  // Filter by search
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    displayTracks = displayTracks.filter(track =>
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query)
    )
  }
  
  const handleSelect = (track) => {
    onSelect?.(track)
    onClose()
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-[hsl(0,0%,7%)] border border-gray-800 rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Music className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Attach Music</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tracks..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
              autoFocus
            />
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2 mt-3">
            {[
              { id: 'all', label: 'All', icon: Music },
              { id: 'liked', label: 'Liked', icon: Heart },
              { id: 'recent', label: 'Recent', icon: Clock },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Track List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {displayTracks.length === 0 ? (
            <div className="text-center py-8">
              <Music className="w-10 h-10 text-gray-700 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No tracks found</p>
            </div>
          ) : (
            displayTracks.map(track => (
              <button
                key={track.id}
                onClick={() => handleSelect(track)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
                  selectedTrack?.id === track.id
                    ? 'bg-purple-500/20 border border-purple-500/30'
                    : 'hover:bg-gray-800/50 border border-transparent'
                }`}
              >
                {/* Album Art */}
                <div 
                  className="w-12 h-12 rounded-md flex-shrink-0 relative overflow-hidden"
                  style={{ background: getGradientCSS(track.id, 'track') }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white/40 text-sm font-bold">{track.title.charAt(0)}</span>
                  </div>
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">{track.title}</p>
                  <p className="text-xs text-gray-500 truncate">{track.artist}</p>
                </div>
                
                {/* Duration */}
                <span className="text-xs text-gray-500">{formatDuration(track.duration)}</span>
                
                {/* Select indicator */}
                {selectedTrack?.id === track.id && (
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                )}
              </button>
            ))
          )}
        </div>
        
        {/* Selected track indicator */}
        {selectedTrack && (
          <div className="p-4 border-t border-gray-800 bg-purple-500/10">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-md flex-shrink-0"
                style={{ background: getGradientCSS(selectedTrack.id, 'track') }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{selectedTrack.title}</p>
                <p className="text-xs text-gray-500 truncate">{selectedTrack.artist}</p>
              </div>
              <button
                onClick={() => onSelect?.(null)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
