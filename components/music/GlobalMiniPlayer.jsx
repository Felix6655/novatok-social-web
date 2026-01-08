'use client'

import { useState } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Repeat, Shuffle, ChevronUp, Coins, X } from 'lucide-react'
import { formatDuration } from '@/lib/music/data'
import { getTrackArtworkSVG } from '@/lib/music/artwork'
import { formatTokens } from '@/lib/music/rewards'
import { useMusicPlayer } from '@/contexts/MusicPlayerContext'
import RewardsModal from './RewardsModal'

export default function GlobalMiniPlayer() {
  const {
    currentTrack,
    isPlaying,
    progress,
    volume,
    shuffle,
    repeat,
    likedTracks,
    rewardsState,
    debugInfo,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    toggleShuffle,
    toggleRepeat,
    likeTrack,
  } = useMusicPlayer()

  const [showRewardsModal, setShowRewardsModal] = useState(false)
  const [minimized, setMinimized] = useState(false)

  if (!currentTrack) return null

  const currentTime = Math.floor((progress / 100) * currentTrack.duration)
  const artworkSVG = getTrackArtworkSVG(currentTrack.id, 80)
  const isMuted = volume < 0.01
  const isLiked = likedTracks.includes(currentTrack.id)
  const totalTokens = rewardsState?.totalTokens || 0

  if (minimized) {
    return (
      <div className="fixed bottom-4 right-4 md:right-8 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 shadow-lg hover:scale-105 transition-transform"
        >
          <div 
            className="w-8 h-8 rounded-md overflow-hidden"
            style={{ backgroundImage: `url("${artworkSVG}")`, backgroundSize: 'cover' }}
          />
          {isPlaying ? (
            <div className="flex items-center gap-0.5 h-4">
              <div className="w-0.5 bg-purple-400 rounded-full animate-pulse" style={{ height: '40%' }} />
              <div className="w-0.5 bg-purple-400 rounded-full animate-pulse" style={{ height: '80%', animationDelay: '0.1s' }} />
              <div className="w-0.5 bg-purple-400 rounded-full animate-pulse" style={{ height: '60%', animationDelay: '0.2s' }} />
            </div>
          ) : (
            <Play className="w-4 h-4 text-white" />
          )}
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 md:left-64 z-40 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50">
        <div className="px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            {/* Track Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div 
                className="w-12 h-12 rounded-lg flex-shrink-0 cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                style={{ backgroundImage: `url("${artworkSVG}")`, backgroundSize: 'cover' }}
              />
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{currentTrack.title}</p>
                <p className="text-xs text-gray-500 truncate">{currentTrack.artist}</p>
              </div>
              <button 
                onClick={() => likeTrack(currentTrack)}
                className={`p-2 rounded-full transition-colors flex-shrink-0 ${
                  isLiked ? 'text-pink-500' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>
            
            {/* Controls */}
            <div className="flex flex-col items-center gap-1 flex-1">
              <div className="flex items-center gap-2">
                <button 
                  onClick={toggleShuffle}
                  className={`p-2 rounded-full transition-colors ${shuffle ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button 
                  onClick={playPrevious}
                  className="p-2 rounded-full text-gray-300 hover:text-white transition-colors"
                >
                  <SkipBack className="w-5 h-5" />
                </button>
                <button 
                  onClick={togglePlayPause}
                  className="p-3 rounded-full bg-white text-black hover:scale-105 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button 
                  onClick={playNext}
                  className="p-2 rounded-full text-gray-300 hover:text-white transition-colors"
                >
                  <SkipForward className="w-5 h-5" />
                </button>
                <button 
                  onClick={toggleRepeat}
                  className={`p-2 rounded-full transition-colors relative ${
                    repeat !== 'off' ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Repeat className="w-4 h-4" />
                  {repeat === 'one' && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] font-bold">1</span>
                  )}
                </button>
              </div>
              
              {/* Progress bar */}
              <div className="flex items-center gap-2 w-full max-w-md">
                <span className="text-[10px] text-gray-500 w-8 text-right">{formatDuration(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-transform"
                  style={{
                    background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progress}%, #374151 ${progress}%, #374151 100%)`
                  }}
                />
                <span className="text-[10px] text-gray-500 w-8">{formatDuration(currentTrack.duration)}</span>
              </div>
            </div>
            
            {/* Right section: Rewards + Volume + Minimize */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              {/* Rewards Button */}
              <button
                onClick={() => setShowRewardsModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">
                  {formatTokens(totalTokens)}
                </span>
              </button>
              
              {/* Minimize */}
              <button 
                onClick={() => setMinimized(true)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-300 transition-colors"
                title="Minimize player"
              >
                <ChevronUp className="w-4 h-4 rotate-180" />
              </button>
              
              {/* Volume */}
              <button
                onClick={() => setVolumeLevel(isMuted ? 0.5 : 0)}
                className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => setVolumeLevel(parseFloat(e.target.value) / 100)}
                className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                style={{
                  background: `linear-gradient(to right, #9ca3af 0%, #9ca3af ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Rewards Modal */}
      <RewardsModal 
        isOpen={showRewardsModal} 
        onClose={() => setShowRewardsModal(false)}
        debugInfo={debugInfo}
      />
    </>
  )
}
