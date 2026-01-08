'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { 
  TRACKS, 
  getTracksByGenre, 
  getTrackById 
} from '@/lib/music/data'
import { 
  getPlayerState, 
  savePlayerState, 
  toggleLikeTrack, 
  getLikedTracks, 
  addToRecentTracks, 
  getRecentTracks 
} from '@/lib/music/player'
import { 
  getRewardsState, 
  startListeningSession, 
  updateListeningSession, 
  endListeningSession,
  getListeningSession,
} from '@/lib/music/rewards'

const MusicPlayerContext = createContext(null)

export function MusicPlayerProvider({ children }) {
  const [mounted, setMounted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState('off')
  const [queue, setQueue] = useState([])
  const [likedTracks, setLikedTracks] = useState([])
  const [recentTracks, setRecentTracks] = useState([])
  const [rewardsState, setRewardsState] = useState(null)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [selectedGenre, setSelectedGenre] = useState('all')
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState({})
  
  // Refs for interval
  const progressIntervalRef = useRef(null)
  const lastToastTimeRef = useRef(0)

  // Initialize on mount
  useEffect(() => {
    setMounted(true)
    
    // Load saved state
    const state = getPlayerState()
    if (state) {
      setVolume(state.volume || 0.8)
      setShuffle(state.shuffle || false)
      setRepeat(state.repeat || 'off')
      if (state.currentTrackId) {
        const track = getTrackById(state.currentTrackId)
        if (track) setCurrentTrack(track)
      }
    }
    
    setLikedTracks(getLikedTracks())
    setRecentTracks(getRecentTracks())
    setRewardsState(getRewardsState())
    
    // Tab visibility tracking
    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible'
      setIsTabVisible(visible)
      console.log('[MusicPlayer] Tab visibility:', visible)
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [])

  // Save player state when it changes
  useEffect(() => {
    if (!mounted) return
    savePlayerState({
      currentTrackId: currentTrack?.id || null,
      volume,
      shuffle,
      repeat,
    })
  }, [mounted, currentTrack, volume, shuffle, repeat])

  // Playback progress and rewards tracking
  useEffect(() => {
    // Clear existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
    
    if (!isPlaying || !currentTrack || !mounted) return
    
    console.log('[MusicPlayer] Starting playback interval')
    
    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (100 / currentTrack.duration)
        
        // Update rewards - get fresh values from state
        const currentVolume = volume
        const tabVisible = document.visibilityState === 'visible'
        
        const result = updateListeningSession(true, currentVolume, tabVisible, newProgress)
        
        // Update debug info
        setDebugInfo({
          isPlaying: true,
          volume: currentVolume,
          isMuted: currentVolume < 0.01,
          isTabVisible: tabVisible,
          visibilityState: document.visibilityState,
          progress: newProgress.toFixed(1),
          session: result.session,
          accumulatedSeconds: result.session?.accumulatedSeconds || 0,
          lastMinuteRewarded: result.session?.lastMinuteRewarded || 0,
          tokensEarned: result.tokensEarned,
          reason: result.reason,
          totalTokens: result.totalTokens || result.state?.totalTokens || 0,
        })
        
        if (result.tokensEarned > 0) {
          console.log('[MusicPlayer] Tokens earned:', result.tokensEarned)
          setRewardsState(getRewardsState())
        }
        
        // Handle track completion
        if (newProgress >= 100) {
          handleNextInternal()
          return 0
        }
        
        return newProgress
      })
    }, 1000)
    
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [isPlaying, currentTrack, mounted, volume])

  // Internal next handler (to avoid dependency issues)
  const handleNextInternal = useCallback(() => {
    endListeningSession()
    
    setQueue(currentQueue => {
      if (repeat === 'one') {
        setProgress(0)
        if (currentTrack) {
          startListeningSession(currentTrack.id, currentTrack.duration)
        }
        return currentQueue
      }
      
      if (currentQueue.length > 0) {
        const nextTrack = shuffle 
          ? currentQueue[Math.floor(Math.random() * currentQueue.length)]
          : currentQueue[0]
        
        setCurrentTrack(nextTrack)
        setProgress(0)
        addToRecentTracks(nextTrack.id)
        setRecentTracks(getRecentTracks())
        startListeningSession(nextTrack.id, nextTrack.duration)
        
        return currentQueue.filter(t => t.id !== nextTrack.id)
      } else if (repeat === 'all') {
        const tracks = getTracksByGenre(selectedGenre)
        if (tracks.length > 0) {
          setCurrentTrack(tracks[0])
          setProgress(0)
          addToRecentTracks(tracks[0].id)
          setRecentTracks(getRecentTracks())
          startListeningSession(tracks[0].id, tracks[0].duration)
          return tracks.slice(1)
        }
      } else {
        setIsPlaying(false)
      }
      
      return currentQueue
    })
  }, [repeat, shuffle, currentTrack, selectedGenre])

  // Public play track function
  const playTrack = useCallback((track, tracksForQueue = null) => {
    if (currentTrack && currentTrack.id !== track.id) {
      endListeningSession()
    }
    
    setCurrentTrack(track)
    setIsPlaying(true)
    setProgress(0)
    addToRecentTracks(track.id)
    setRecentTracks(getRecentTracks())
    
    // Start new listening session
    startListeningSession(track.id, track.duration)
    
    // Set queue
    if (tracksForQueue) {
      const trackIndex = tracksForQueue.findIndex(t => t.id === track.id)
      if (trackIndex > -1) {
        setQueue(tracksForQueue.slice(trackIndex + 1))
      }
    } else {
      const tracks = getTracksByGenre(selectedGenre)
      const trackIndex = tracks.findIndex(t => t.id === track.id)
      if (trackIndex > -1) {
        setQueue(tracks.slice(trackIndex + 1))
      }
    }
    
    console.log('[MusicPlayer] Playing track:', track.title)
  }, [currentTrack, selectedGenre])

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])

  const playNext = useCallback(() => {
    handleNextInternal()
  }, [handleNextInternal])

  const playPrevious = useCallback(() => {
    if (progress > 10) {
      setProgress(0)
    } else {
      const tracks = getTracksByGenre(selectedGenre)
      const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id)
      if (currentIndex > 0) {
        playTrack(tracks[currentIndex - 1], tracks)
      }
    }
  }, [progress, selectedGenre, currentTrack, playTrack])

  const seekTo = useCallback((value) => {
    setProgress(value)
  }, [])

  const setVolumeLevel = useCallback((value) => {
    setVolume(value)
  }, [])

  const toggleShuffle = useCallback(() => {
    setShuffle(prev => !prev)
  }, [])

  const toggleRepeat = useCallback(() => {
    setRepeat(prev => {
      const modes = ['off', 'all', 'one']
      const currentIndex = modes.indexOf(prev)
      return modes[(currentIndex + 1) % modes.length]
    })
  }, [])

  const likeTrack = useCallback((track) => {
    const isNowLiked = toggleLikeTrack(track.id)
    setLikedTracks(getLikedTracks())
    return isNowLiked
  }, [])

  const playPlaylist = useCallback((playlist) => {
    const tracks = playlist.trackIds.map(id => getTrackById(id)).filter(Boolean)
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks)
    }
  }, [playTrack])

  const value = {
    // State
    mounted,
    currentTrack,
    isPlaying,
    progress,
    volume,
    shuffle,
    repeat,
    queue,
    likedTracks,
    recentTracks,
    rewardsState,
    isTabVisible,
    selectedGenre,
    debugInfo,
    
    // Actions
    playTrack,
    togglePlayPause,
    playNext,
    playPrevious,
    seekTo,
    setVolumeLevel,
    toggleShuffle,
    toggleRepeat,
    likeTrack,
    playPlaylist,
    setSelectedGenre,
    refreshRewards: () => setRewardsState(getRewardsState()),
    refreshLiked: () => setLikedTracks(getLikedTracks()),
    refreshRecent: () => setRecentTracks(getRecentTracks()),
  }

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  )
}

export function useMusicPlayer() {
  const context = useContext(MusicPlayerContext)
  if (!context) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider')
  }
  return context
}
