'use client'

import { useState, useEffect } from 'react'
import { Music, Search, Heart, Clock, TrendingUp, Sparkles, Coins } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { TRACKS, PLAYLISTS, GENRES, getTracksByGenre, getTrackById } from '@/lib/music/data'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import { formatTokens } from '@/lib/music/rewards'
import TrackCard from '@/components/music/TrackCard'
import PlaylistCard from '@/components/music/PlaylistCard'
import RewardsModal from '@/components/music/RewardsModal'

export default function MusicPage() {
  const { toast } = useToast()
  const {
    mounted,
    currentTrack,
    isPlaying,
    likedTracks,
    recentTracks,
    rewardsState,
    selectedGenre,
    debugInfo,
    playTrack,
    togglePlayPause,
    likeTrack,
    playPlaylist,
    setSelectedGenre,
    refreshLiked,
  } = useMusicPlayer()
  
  const [activeTab, setActiveTab] = useState('discover')
  const [searchQuery, setSearchQuery] = useState('')
  const [showRewardsModal, setShowRewardsModal] = useState(false)
  
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
  
  const handleLikeTrack = (track) => {
    const isNowLiked = likeTrack(track)
    toast({ 
      type: isNowLiked ? 'success' : 'info', 
      message: isNowLiked ? `Added "${track.title}" to favorites` : `Removed from favorites`
    })
  }
  
  const handlePlayPlaylist = (playlist) => {
    playPlaylist(playlist)
    toast({ type: 'success', message: `Playing "${playlist.title}"` })
  }
  
  const handlePlayTrack = (track) => {
    const tracks = getTracksByGenre(selectedGenre)
    playTrack(track, tracks)
  }
  
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-gray-800/50 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
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
        
        {/* Rewards Badge */}
        <button
          onClick={() => setShowRewardsModal(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
        >
          <Coins className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <p className="text-sm font-semibold text-amber-400">{formatTokens(rewardsState?.totalTokens || 0)}</p>
            <p className="text-[10px] text-gray-500">tokens</p>
          </div>
        </button>
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
                  onPause={togglePlayPause}
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
                    onPause={togglePlayPause}
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
                  onPause={togglePlayPause}
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
                  onPause={togglePlayPause}
                  onLike={handleLikeTrack}
                  compact
                />
              ))}
            </div>
          )}
        </section>
      )}
      
      {/* Rewards Modal */}
      <RewardsModal 
        isOpen={showRewardsModal} 
        onClose={() => setShowRewardsModal(false)}
        debugInfo={debugInfo}
      />
    </div>
  )
}
