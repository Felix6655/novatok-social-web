'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, Repeat, Shuffle, ChevronUp, Coins } from 'lucide-react'
import { formatDuration } from '@/lib/music/data'
import { getGradientCSS, getTrackArtworkSVG } from '@/lib/music/artwork'
import { getRewardsState, formatTokens, getDailyProgress } from '@/lib/music/rewards'
import RewardsModal from './RewardsModal'

export default function MiniPlayer({ 
  track, 
  isPlaying, 
  progress,
  volume,
  isLiked,
  shuffle,
  repeat,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onLike,
  onShuffle,
  onRepeat,
  onExpand,
  rewardsState // Optional: pass updated rewards from parent
}) {
  const [showRewardsModal, setShowRewardsModal] = useState(false)
  const [displayTokens, setDisplayTokens] = useState(0)
  const [tokenAnimation, setTokenAnimation] = useState(false)
  const prevTokensRef = useRef(0)

  // Load rewards state
  useEffect(() => {
    const state = rewardsState || getRewardsState()
    const newTokens = state.totalTokens || 0
    
    // Animate if tokens increased
    if (newTokens > prevTokensRef.current) {
      setTokenAnimation(true)
      setTimeout(() => setTokenAnimation(false), 500)
    }
    
    setDisplayTokens(newTokens)
    prevTokensRef.current = newTokens
  }, [rewardsState])

  if (!track) return null
  
  const currentTime = Math.floor((progress / 100) * track.duration)
  const artworkSVG = getTrackArtworkSVG(track.id, 80)
  const isMuted = volume < 0.01
  
  return (
    <>
      <div className="bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Track Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-lg flex-shrink-0 cursor-pointer hover:scale-105 transition-transform overflow-hidden"
              style={{ backgroundImage: `url("${artworkSVG}")`, backgroundSize: 'cover' }}
              onClick={onExpand}
            />
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{track.title}</p>
              <p className="text-xs text-gray-500 truncate">{track.artist}</p>
            </div>
            <button 
              onClick={onLike}
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
                onClick={onShuffle}
                className={`p-2 rounded-full transition-colors ${shuffle ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>
              <button 
                onClick={onPrevious}
                className="p-2 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button 
                onClick={onPlayPause}
                className="p-3 rounded-full bg-white text-black hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </button>
              <button 
                onClick={onNext}
                className="p-2 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button 
                onClick={onRepeat}
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
                onChange={(e) => onSeek?.(parseFloat(e.target.value))}
                className="flex-1 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-transform"
                style={{
                  background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${progress}%, #374151 ${progress}%, #374151 100%)`
                }}
              />
              <span className="text-[10px] text-gray-500 w-8">{formatDuration(track.duration)}</span>
            </div>
          </div>
          
          {/* Right section: Rewards + Volume */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            {/* Rewards Button */}
            <button
              onClick={() => setShowRewardsModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all ${
                tokenAnimation ? 'scale-110' : ''
              }`}
            >
              <Coins className={`w-3.5 h-3.5 text-amber-400 ${tokenAnimation ? 'animate-bounce' : ''}`} />
              <span className="text-xs font-medium text-amber-400">
                {formatTokens(displayTokens)}
              </span>
            </button>
            
            <button 
              onClick={onExpand}
              className="p-2 rounded-full text-gray-500 hover:text-gray-300 transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            
            {/* Volume */}
            <button
              onClick={() => onVolumeChange?.(isMuted ? 0.5 : 0)}
              className="p-1 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) => onVolumeChange?.(parseFloat(e.target.value) / 100)}
              className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              style={{
                background: `linear-gradient(to right, #9ca3af 0%, #9ca3af ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Rewards Modal */}
      <RewardsModal 
        isOpen={showRewardsModal} 
        onClose={() => setShowRewardsModal(false)} 
      />
    </>
  )
}
