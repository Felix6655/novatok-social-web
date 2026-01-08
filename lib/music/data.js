// NovaTok Music - Demo Data
// Synthetic music data for the music player

// Genre categories - 40 curated genres
export const GENRES = [
  // Default
  { id: 'all', label: 'All', icon: '🎵', category: 'default' },
  
  // Electronic & Dance (10)
  { id: 'electronic', label: 'Electronic', icon: '🎧', category: 'electronic' },
  { id: 'house', label: 'House', icon: '🏠', category: 'electronic' },
  { id: 'techno', label: 'Techno', icon: '⚡', category: 'electronic' },
  { id: 'deep-house', label: 'Deep House', icon: '🌊', category: 'electronic' },
  { id: 'progressive-house', label: 'Progressive House', icon: '📈', category: 'electronic' },
  { id: 'trance', label: 'Trance', icon: '🌀', category: 'electronic' },
  { id: 'drum-bass', label: 'Drum & Bass', icon: '🥁', category: 'electronic' },
  { id: 'dubstep', label: 'Dubstep', icon: '💥', category: 'electronic' },
  { id: 'future-bass', label: 'Future Bass', icon: '🔮', category: 'electronic' },
  { id: 'synthwave', label: 'Synthwave', icon: '🌆', category: 'electronic' },
  
  // Chill & Relaxation (10)
  { id: 'chill', label: 'Chill', icon: '❄️', category: 'chill' },
  { id: 'lofi', label: 'Lo-Fi', icon: '📻', category: 'chill' },
  { id: 'ambient', label: 'Ambient', icon: '✨', category: 'chill' },
  { id: 'downtempo', label: 'Downtempo', icon: '🐢', category: 'chill' },
  { id: 'chillhop', label: 'Chillhop', icon: '🎤', category: 'chill' },
  { id: 'study', label: 'Study', icon: '📚', category: 'chill' },
  { id: 'focus', label: 'Focus', icon: '🎯', category: 'chill' },
  { id: 'sleep', label: 'Sleep', icon: '😴', category: 'chill' },
  { id: 'meditation', label: 'Meditation', icon: '🧘', category: 'chill' },
  { id: 'relax', label: 'Relax', icon: '🛋️', category: 'chill' },
  
  // Mood & Activity (8)
  { id: 'workout', label: 'Workout', icon: '💪', category: 'mood' },
  { id: 'night-drive', label: 'Night Drive', icon: '🚗', category: 'mood' },
  { id: 'coffee-shop', label: 'Coffee Shop', icon: '☕', category: 'mood' },
  { id: 'late-night', label: 'Late Night', icon: '🌙', category: 'mood' },
  { id: 'morning-vibes', label: 'Morning Vibes', icon: '🌅', category: 'mood' },
  { id: 'sunset', label: 'Sunset', icon: '🌇', category: 'mood' },
  { id: 'rainy-day', label: 'Rainy Day', icon: '🌧️', category: 'mood' },
  { id: 'dreamy', label: 'Dreamy', icon: '💭', category: 'mood' },
  
  // Style & Aesthetic (12)
  { id: 'indie-electronic', label: 'Indie Electronic', icon: '🎸', category: 'style' },
  { id: 'experimental', label: 'Experimental', icon: '🧪', category: 'style' },
  { id: 'minimal', label: 'Minimal', icon: '◻️', category: 'style' },
  { id: 'vaporwave', label: 'Vaporwave', icon: '🌴', category: 'style' },
  { id: 'retrowave', label: 'Retrowave', icon: '📼', category: 'style' },
  { id: 'neo-classical', label: 'Neo-Classical', icon: '🎹', category: 'style' },
  { id: 'cinematic', label: 'Cinematic', icon: '🎬', category: 'style' },
  { id: 'space', label: 'Space', icon: '🚀', category: 'style' },
  { id: 'upbeat', label: 'Upbeat', icon: '🎉', category: 'style' },
  { id: 'melodic', label: 'Melodic', icon: '🎶', category: 'style' },
  { id: 'dark', label: 'Dark', icon: '🖤', category: 'style' },
  { id: 'atmospheric', label: 'Atmospheric', icon: '🌫️', category: 'style' },
]

// Genre categories for UI grouping
export const GENRE_CATEGORIES = [
  { id: 'electronic', label: 'Electronic & Dance', color: 'purple' },
  { id: 'chill', label: 'Chill & Relaxation', color: 'teal' },
  { id: 'mood', label: 'Mood & Activity', color: 'amber' },
  { id: 'style', label: 'Style & Aesthetic', color: 'pink' },
]

// Demo tracks with multi-genre support
export const TRACKS = [
  {
    id: '1',
    title: 'Cosmic Dreams',
    artist: 'Nova Collective',
    album: 'Stellar Journeys',
    duration: 234,
    genres: ['electronic', 'progressive-house', 'melodic', 'space', 'upbeat'],
    coverGradient: 'from-purple-600 to-pink-600',
    bpm: 128,
    plays: 1240000,
  },
  {
    id: '2',
    title: 'Midnight City Lights',
    artist: 'Synth Riders',
    album: 'Neon Horizons',
    duration: 198,
    genres: ['synthwave', 'retrowave', 'night-drive', 'late-night', 'melodic'],
    coverGradient: 'from-cyan-500 to-blue-600',
    bpm: 118,
    plays: 890000,
  },
  {
    id: '3',
    title: 'Rainy Day Vibes',
    artist: 'Lo-Fi Dreams',
    album: 'Cozy Afternoons',
    duration: 186,
    genres: ['lofi', 'chillhop', 'rainy-day', 'study', 'chill', 'relax'],
    coverGradient: 'from-amber-500 to-orange-600',
    bpm: 85,
    plays: 2100000,
  },
  {
    id: '4',
    title: 'Ocean Breeze',
    artist: 'Chill Wave',
    album: 'Summer Escapes',
    duration: 245,
    genres: ['chill', 'ambient', 'relax', 'dreamy', 'atmospheric', 'downtempo'],
    coverGradient: 'from-teal-500 to-emerald-600',
    bpm: 95,
    plays: 1560000,
  },
  {
    id: '5',
    title: 'Digital Sunset',
    artist: 'Pixel Beats',
    album: 'Retro Future',
    duration: 212,
    genres: ['synthwave', 'retrowave', 'sunset', 'vaporwave', 'melodic'],
    coverGradient: 'from-rose-500 to-red-600',
    bpm: 110,
    plays: 720000,
  },
  {
    id: '6',
    title: 'Floating in Space',
    artist: 'Astral Sounds',
    album: 'Zero Gravity',
    duration: 320,
    genres: ['ambient', 'space', 'meditation', 'atmospheric', 'sleep', 'dreamy'],
    coverGradient: 'from-indigo-600 to-purple-700',
    bpm: 70,
    plays: 980000,
  },
  {
    id: '7',
    title: 'Late Night Drive',
    artist: 'Neon Pulse',
    album: 'After Hours',
    duration: 203,
    genres: ['electronic', 'night-drive', 'late-night', 'synthwave', 'dark'],
    coverGradient: 'from-violet-500 to-purple-600',
    bpm: 122,
    plays: 1340000,
  },
  {
    id: '8',
    title: 'Coffee Shop Morning',
    artist: 'Mellow Beats',
    album: 'Daily Rituals',
    duration: 175,
    genres: ['lofi', 'coffee-shop', 'morning-vibes', 'chillhop', 'study', 'focus'],
    coverGradient: 'from-yellow-500 to-amber-600',
    bpm: 78,
    plays: 1890000,
  },
  {
    id: '9',
    title: 'Underground',
    artist: 'Bass Collective',
    album: 'Deep Sessions',
    duration: 267,
    genres: ['house', 'deep-house', 'dark', 'minimal', 'late-night'],
    coverGradient: 'from-emerald-500 to-teal-600',
    bpm: 124,
    plays: 650000,
  },
  {
    id: '10',
    title: 'Electric Dreams',
    artist: 'Circuit Breaker',
    album: 'Voltage',
    duration: 228,
    genres: ['techno', 'electronic', 'workout', 'upbeat', 'dark'],
    coverGradient: 'from-blue-500 to-cyan-600',
    bpm: 138,
    plays: 420000,
  },
  {
    id: '11',
    title: 'Starlight Melody',
    artist: 'Celestial',
    album: 'Night Sky',
    duration: 289,
    genres: ['ambient', 'neo-classical', 'cinematic', 'atmospheric', 'dreamy', 'sleep'],
    coverGradient: 'from-slate-600 to-gray-700',
    bpm: 65,
    plays: 780000,
  },
  {
    id: '12',
    title: 'Summer Nights',
    artist: 'Tropical House',
    album: 'Island Vibes',
    duration: 195,
    genres: ['house', 'progressive-house', 'sunset', 'upbeat', 'melodic'],
    coverGradient: 'from-orange-500 to-pink-500',
    bpm: 120,
    plays: 1120000,
  },
  // Additional tracks to demonstrate multi-genre coverage
  {
    id: '13',
    title: 'Dawn Patrol',
    artist: 'Horizon',
    album: 'First Light',
    duration: 256,
    genres: ['trance', 'progressive-house', 'upbeat', 'melodic', 'morning-vibes'],
    coverGradient: 'from-pink-500 to-orange-400',
    bpm: 138,
    plays: 560000,
  },
  {
    id: '14',
    title: 'Bass Drop City',
    artist: 'Heavy Hitters',
    album: 'Impact Zone',
    duration: 198,
    genres: ['dubstep', 'drum-bass', 'workout', 'dark', 'electronic'],
    coverGradient: 'from-red-600 to-purple-700',
    bpm: 150,
    plays: 890000,
  },
  {
    id: '15',
    title: 'Future Feels',
    artist: 'Wave Theory',
    album: 'Emotions',
    duration: 223,
    genres: ['future-bass', 'melodic', 'upbeat', 'electronic', 'dreamy'],
    coverGradient: 'from-purple-400 to-pink-500',
    bpm: 130,
    plays: 1450000,
  },
  {
    id: '16',
    title: 'Analog Dreams',
    artist: 'Retro Synth',
    album: '1984',
    duration: 245,
    genres: ['vaporwave', 'retrowave', 'synthwave', 'experimental', 'chill'],
    coverGradient: 'from-cyan-400 to-purple-500',
    bpm: 100,
    plays: 340000,
  },
  {
    id: '17',
    title: 'Piano & Rain',
    artist: 'Solitude',
    album: 'Quiet Moments',
    duration: 312,
    genres: ['neo-classical', 'ambient', 'rainy-day', 'sleep', 'meditation', 'relax'],
    coverGradient: 'from-slate-500 to-blue-600',
    bpm: 60,
    plays: 2300000,
  },
  {
    id: '18',
    title: 'Epic Horizons',
    artist: 'Orchestral Waves',
    album: 'Blockbuster',
    duration: 287,
    genres: ['cinematic', 'atmospheric', 'space', 'melodic', 'upbeat'],
    coverGradient: 'from-amber-600 to-red-600',
    bpm: 95,
    plays: 670000,
  },
  {
    id: '19',
    title: 'Minimal State',
    artist: 'Less Is More',
    album: 'Reduction',
    duration: 356,
    genres: ['minimal', 'techno', 'focus', 'experimental', 'dark'],
    coverGradient: 'from-gray-600 to-gray-800',
    bpm: 122,
    plays: 230000,
  },
  {
    id: '20',
    title: 'Indie Pulse',
    artist: 'Bedroom Producer',
    album: 'DIY Sounds',
    duration: 198,
    genres: ['indie-electronic', 'experimental', 'chill', 'melodic', 'atmospheric'],
    coverGradient: 'from-green-500 to-teal-600',
    bpm: 108,
    plays: 410000,
  },
  {
    id: '21',
    title: 'Deep Focus',
    artist: 'Concentration',
    album: 'Productivity Suite',
    duration: 420,
    genres: ['focus', 'study', 'ambient', 'minimal', 'atmospheric'],
    coverGradient: 'from-blue-600 to-indigo-700',
    bpm: 70,
    plays: 3200000,
  },
  {
    id: '22',
    title: 'Night Runner',
    artist: 'Neon Arcade',
    album: 'Cyber City',
    duration: 215,
    genres: ['synthwave', 'dark', 'night-drive', 'retrowave', 'workout'],
    coverGradient: 'from-red-500 to-pink-600',
    bpm: 128,
    plays: 780000,
  },
  {
    id: '23',
    title: 'Downtempo Dreams',
    artist: 'Slow Motion',
    album: 'Easy Going',
    duration: 267,
    genres: ['downtempo', 'chill', 'relax', 'atmospheric', 'dreamy'],
    coverGradient: 'from-teal-400 to-blue-500',
    bpm: 85,
    plays: 540000,
  },
  {
    id: '24',
    title: 'Energy Boost',
    artist: 'Gym Mode',
    album: 'Beast Mode',
    duration: 189,
    genres: ['workout', 'electronic', 'upbeat', 'drum-bass', 'techno'],
    coverGradient: 'from-orange-500 to-red-600',
    bpm: 145,
    plays: 1670000,
  },
]

// Playlists
export const PLAYLISTS = [
  {
    id: 'featured',
    title: 'Featured Mix',
    description: 'The best tracks handpicked for you',
    coverGradient: 'from-purple-600 via-pink-600 to-rose-600',
    trackIds: ['1', '2', '3', '4', '5', '15'],
    followers: 12500,
  },
  {
    id: 'chill',
    title: 'Chill Vibes',
    description: 'Relax and unwind with these smooth beats',
    coverGradient: 'from-teal-500 to-cyan-600',
    trackIds: ['3', '4', '8', '6', '17', '23'],
    followers: 8900,
  },
  {
    id: 'night',
    title: 'Late Night Sessions',
    description: 'Perfect for those midnight moments',
    coverGradient: 'from-indigo-600 to-purple-700',
    trackIds: ['2', '5', '7', '10', '9', '22'],
    followers: 6700,
  },
  {
    id: 'focus',
    title: 'Focus Flow',
    description: 'Stay productive with these concentration boosters',
    coverGradient: 'from-amber-500 to-orange-600',
    trackIds: ['3', '6', '8', '11', '17', '21'],
    followers: 15200,
  },
  {
    id: 'workout',
    title: 'Workout Power',
    description: 'High energy tracks to fuel your exercise',
    coverGradient: 'from-red-500 to-orange-600',
    trackIds: ['10', '14', '24', '22', '13'],
    followers: 9800,
  },
  {
    id: 'synthwave',
    title: 'Synthwave Collection',
    description: 'Retro-futuristic sounds from the 80s',
    coverGradient: 'from-purple-500 to-cyan-500',
    trackIds: ['2', '5', '7', '16', '22'],
    followers: 7400,
  },
]

// Utility functions
export function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatPlays(plays) {
  if (plays >= 1000000) return `${(plays / 1000000).toFixed(1)}M`
  if (plays >= 1000) return `${(plays / 1000).toFixed(0)}K`
  return plays.toString()
}

export function getTrackById(id) {
  return TRACKS.find(t => t.id === id || t.id === String(id))
}

/**
 * Get tracks by genre - supports multi-genre matching
 * @param {string} genreId - Genre ID to filter by
 * @returns {Array} Tracks that belong to the specified genre
 */
export function getTracksByGenre(genreId) {
  if (genreId === 'all') return TRACKS
  return TRACKS.filter(t => {
    // Support both old single-genre format and new multi-genre format
    if (Array.isArray(t.genres)) {
      return t.genres.includes(genreId)
    }
    return t.genre === genreId
  })
}

/**
 * Get tracks matching multiple genres (union)
 * @param {string[]} genreIds - Array of genre IDs
 * @returns {Array} Tracks that belong to any of the specified genres
 */
export function getTracksByGenres(genreIds) {
  if (!genreIds || genreIds.length === 0) return TRACKS
  if (genreIds.includes('all')) return TRACKS
  
  return TRACKS.filter(t => {
    const trackGenres = Array.isArray(t.genres) ? t.genres : [t.genre]
    return genreIds.some(g => trackGenres.includes(g))
  })
}

/**
 * Get all genres a track belongs to
 * @param {object} track - Track object
 * @returns {Array} Array of genre objects
 */
export function getTrackGenres(track) {
  const genreIds = Array.isArray(track.genres) ? track.genres : [track.genre]
  return genreIds.map(id => GENRES.find(g => g.id === id)).filter(Boolean)
}

/**
 * Get genre count (how many tracks per genre)
 * @returns {Object} Map of genreId to track count
 */
export function getGenreCounts() {
  const counts = {}
  GENRES.forEach(g => { counts[g.id] = 0 })
  counts['all'] = TRACKS.length
  
  TRACKS.forEach(t => {
    const trackGenres = Array.isArray(t.genres) ? t.genres : [t.genre]
    trackGenres.forEach(g => {
      if (counts[g] !== undefined) counts[g]++
    })
  })
  
  return counts
}

export function getPlaylistTracks(playlist) {
  return playlist.trackIds.map(id => getTrackById(id)).filter(Boolean)
}

/**
 * Get genres grouped by category
 * @returns {Object} Genres grouped by category
 */
export function getGenresByCategory() {
  const grouped = {}
  GENRE_CATEGORIES.forEach(cat => {
    grouped[cat.id] = GENRES.filter(g => g.category === cat.id)
  })
  return grouped
}
