'use client'

import { useState, useEffect, useCallback } from 'react'
import { Music, Search, Heart, Clock, Disc, TrendingUp, Sparkles } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { TRACKS, PLAYLISTS, GENRES, getTracksByGenre, getTrackById, formatDuration } from '@/lib/music/data'
import { getPlayerState, savePlayerState, toggleLikeTrack, isTrackLiked, getLikedTracks, addToRecentTracks, getRecentTracks } from '@/lib/music/player'
import TrackCard from '@/components/music/TrackCard'
import PlaylistCard from '@/components/music/PlaylistCard'
import MiniPlayer from '@/components/music/MiniPlayer'

export default function MusicPage() {
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('discover')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [likedTracks, setLikedTracks] = useState([])
  const [recentTracks, setRecentTracks] = useState([])
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('off')
  const [queue, setQueue] = useState([])
  
  useEffect(() => {
    setMounted(true)
    const state = getPlayerState()
    if (state) {
      setVolume(state.volume || 0.8)
      setShuffle(state.shuffle || false)
      setRepeat(state.repeat || 'off')
      if (state.currentTrackId) {
        setCurrentTrack(getTrackById(state.currentTrackId))
      }
    }
    setLikedTracks(getLikedTracks())
    setRecentTracks(getRecentTracks())
  }, [])
  
  // Simulate playback progress
  useEffect(() => {
    if (!isPlaying || !currentTrack) return
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          handleNext()
          return 0
        }
        return prev + (100 / currentTrack.duration)
      })
    }, 1000)
    
    return () => clearInterval(interval)
  }, [isPlaying, currentTrack])
  
  // Save player state on changes
  useEffect(() => {
    if (!mounted) return
    savePlayerState({
      currentTrackId: currentTrack?.id || null,
      volume,
      shuffle,
      repeat,
    })
  }, [mounted, currentTrack, volume, shuffle, repeat])
  
  const handlePlayTrack = useCallback((track) => {
    setCurrentTrack(track)
    setIsPlaying(true)
    setProgress(0)
    addToRecentTracks(track.id)
    setRecentTracks(getRecentTracks())
    
    // Set queue to filtered tracks
    const tracks = getTracksByGenre(selectedGenre)
    const trackIndex = tracks.findIndex(t => t.id === track.id)
    if (trackIndex > -1) {
      setQueue(tracks.slice(trackIndex + 1))
    }
  }, [selectedGenre])
  
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }
  
  const handleNext = useCallback(() => {
    if (repeat === 'one') {
      setProgress(0)
      return
    }
    
    if (queue.length > 0) {
      const nextTrack = shuffle 
        ? queue[Math.floor(Math.random() * queue.length)]
        : queue[0]
      setCurrentTrack(nextTrack)
      setQueue(prev => prev.filter(t => t.id !== nextTrack.id))
      setProgress(0)
      addToRecentTracks(nextTrack.id)
    } else if (repeat === 'all') {
      const tracks = getTracksByGenre(selectedGenre)
      if (tracks.length > 0) {
        handlePlayTrack(tracks[0])
      }
    } else {
      setIsPlaying(false)
    }
  }, [queue, shuffle, repeat, selectedGenre, handlePlayTrack])
  
  const handlePrevious = () => {
    if (progress > 10) {
      setProgress(0)
    } else {
      // Go to previous track in current view
      const tracks = getTracksByGenre(selectedGenre)
      const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id)
      if (currentIndex > 0) {
        handlePlayTrack(tracks[currentIndex - 1])
      }
    }
  }
  
  const handleLikeTrack = (track) => {
    const isNowLiked = toggleLikeTrack(track.id)
    setLikedTracks(getLikedTracks())
    toast({ 
      type: isNowLiked ? 'success' : 'info', 
      message: isNowLiked ? `Added "${track.title}" to favorites` : `Removed from favorites`
    })
  }
  
  const handlePlayPlaylist = (playlist) => {
    const tracks = playlist.trackIds.map(id => getTrackById(id)).filter(Boolean)
    if (tracks.length > 0) {
      handlePlayTrack(tracks[0])
      setQueue(tracks.slice(1))
      toast({ type: 'success', message: `Playing "${playlist.title}"` })
    }
  }
  
  const handleSeek = (value) => {
    setProgress(value)
  }
  
  const handleVolumeChange = (value) => {
    setVolume(value)
  }
  
  const handleToggleShuffle = () => {
    setShuffle(!shuffle)
    toast({ type: 'info', message: shuffle ? 'Shuffle off' : 'Shuffle on' })
  }
  
  const handleToggleRepeat = () => {
    const modes = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(repeat)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setRepeat(nextMode)
    toast({ type: 'info', message: `Repeat: ${nextMode === 'off' ? 'Off' : nextMode === 'all' ? 'All' : 'One'}` })
  }
  
  // Filter tracks
  const filteredTracks = getTracksByGenre(selectedGenre).filter(track => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return track.title.toLowerCase().includes(query) || 
           track.artist.toLowerCase().includes(query) ||
           track.album.toLowerCase().includes(query)
  })
  
  // Get liked track objects
  const likedTrackObjects = likedTracks.map(id => getTrackById(id)).filter(Boolean)
  
  // Get recent track objects
  const recentTrackObjects = recentTracks.map(id => getTrackById(id)).filter(Boolean).slice(0, 10)
  
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-800/50 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <Music className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">NovaTok Music</h1>
            <p className="text-sm text-gray-500">Discover your sound</p>
          </div>
        </div>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search tracks, artists, albums..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500/50"
        />
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'discover', label: 'Discover', icon: Sparkles },
          { id: 'trending', label: 'Trending', icon: TrendingUp },
          { id: 'liked', label: 'Liked', icon: Heart },
          { id: 'recent', label: 'Recent', icon: Clock },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'bg-gray-800/50 text-gray-400 hover:text-white border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'discover' && (
        <>
          {/* Featured Playlists */}
          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">Featured Playlists</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PLAYLISTS.map(playlist => (
                <PlaylistCard 
                  key={playlist.id} 
                  playlist={playlist} 
                  onPlay={handlePlayPlaylist}
                />
              ))}
            </div>
          </section>
          
          {/* Genre Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {GENRES.map(genre => (
              <button
                key={genre.id}
                onClick={() => setSelectedGenre(genre.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedGenre === genre.id
                    ? 'bg-white text-black'
                    : 'bg-gray-800/50 text-gray-400 hover:text-white'
                }`}
              >
                <span>{genre.icon}</span>
                {genre.label}
              </button>
            ))}
          </div>
          
          {/* Tracks Grid */}
          <section>
            <h2 className="text-sm font-semibold text-gray-300 mb-3">
              {selectedGenre === 'all' ? 'All Tracks' : GENRES.find(g => g.id === selectedGenre)?.label}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredTracks.map(track => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying}
                  isCurrentTrack={currentTrack?.id === track.id}
                  isLiked={likedTracks.includes(track.id)}
                  onPlay={handlePlayTrack}
                  onPause={() => setIsPlaying(false)}
                  onLike={handleLikeTrack}
                />
              ))}
            </div>
          </section>
        </>
      )}
      
      {activeTab === 'trending' && (
        <section>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Top Tracks</h2>
          <div className="space-y-1">
            {[...TRACKS].sort((a, b) => b.plays - a.plays).map((track, index) => (
              <div key={track.id} className="flex items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-gray-500">{index + 1}</span>
                <div className="flex-1">
                  <TrackCard
                    track={track}
                    isPlaying={isPlaying}
                    isCurrentTrack={currentTrack?.id === track.id}
                    isLiked={likedTracks.includes(track.id)}
                    onPlay={handlePlayTrack}
                    onPause={() => setIsPlaying(false)}
                    onLike={handleLikeTrack}
                    compact
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      
      {activeTab === 'liked' && (
        <section>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">
            Your Favorites ({likedTrackObjects.length})
          </h2>
          {likedTrackObjects.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No liked tracks yet</p>
              <p className="text-gray-600 text-sm">Tap the heart icon to save your favorites</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {likedTrackObjects.map(track => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying}
                  isCurrentTrack={currentTrack?.id === track.id}
                  isLiked={true}
                  onPlay={handlePlayTrack}
                  onPause={() => setIsPlaying(false)}
                  onLike={handleLikeTrack}
                />
              ))}
            </div>
          )}
        </section>
      )}
      
      {activeTab === 'recent' && (
        <section>
          <h2 className="text-sm font-semibold text-gray-300 mb-3">Recently Played</h2>
          {recentTrackObjects.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500">No recent tracks</p>
              <p className="text-gray-600 text-sm">Start listening to build your history</p>
            </div>
          ) : (
            <div className="space-y-1">
              {recentTrackObjects.map(track => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={isPlaying}
                  isCurrentTrack={currentTrack?.id === track.id}
                  isLiked={likedTracks.includes(track.id)}
                  onPlay={handlePlayTrack}
                  onPause={() => setIsPlaying(false)}
                  onLike={handleLikeTrack}
                  compact
                />
              ))}
            </div>
          )}
        </section>
      )}
      
      {/* Mini Player - Fixed at bottom */}
      {currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40">
          <MiniPlayer
            track={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            volume={volume}
            isLiked={likedTracks.includes(currentTrack.id)}
            shuffle={shuffle}
            repeat={repeat}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onLike={() => handleLikeTrack(currentTrack)}
            onShuffle={handleToggleShuffle}
            onRepeat={handleToggleRepeat}
          />
        </div>
      )}
    </div>
  )
}
