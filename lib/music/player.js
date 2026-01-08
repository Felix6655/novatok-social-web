// NovaTok Music - Player State Management
// Uses localStorage for persistence

const PLAYER_STATE_KEY = 'novatok_music_player_state'
const LIKED_TRACKS_KEY = 'novatok_music_liked_tracks'
const RECENT_TRACKS_KEY = 'novatok_music_recent_tracks'

// Get player state from localStorage
export function getPlayerState() {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(PLAYER_STATE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.warn('Failed to load player state:', e)
  }
  
  return {
    currentTrackId: null,
    isPlaying: false,
    volume: 0.8,
    progress: 0,
    shuffle: false,
    repeat: 'off', // 'off', 'all', 'one'
    queue: [],
  }
}

// Save player state to localStorage
export function savePlayerState(state) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(PLAYER_STATE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save player state:', e)
  }
}

// Get liked tracks
export function getLikedTracks() {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(LIKED_TRACKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Toggle track like
export function toggleLikeTrack(trackId) {
  if (typeof window === 'undefined') return false
  
  try {
    const liked = getLikedTracks()
    const index = liked.indexOf(trackId)
    
    if (index > -1) {
      liked.splice(index, 1)
      localStorage.setItem(LIKED_TRACKS_KEY, JSON.stringify(liked))
      return false
    } else {
      liked.push(trackId)
      localStorage.setItem(LIKED_TRACKS_KEY, JSON.stringify(liked))
      return true
    }
  } catch (e) {
    console.error('Failed to toggle like:', e)
    return false
  }
}

// Check if track is liked
export function isTrackLiked(trackId) {
  return getLikedTracks().includes(trackId)
}

// Get recent tracks
export function getRecentTracks() {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(RECENT_TRACKS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Add to recent tracks
export function addToRecentTracks(trackId) {
  if (typeof window === 'undefined') return
  
  try {
    let recent = getRecentTracks()
    recent = recent.filter(id => id !== trackId)
    recent.unshift(trackId)
    recent = recent.slice(0, 20) // Keep only last 20
    localStorage.setItem(RECENT_TRACKS_KEY, JSON.stringify(recent))
  } catch (e) {
    console.error('Failed to add to recent:', e)
  }
}
