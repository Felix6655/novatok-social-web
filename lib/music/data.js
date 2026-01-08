// NovaTok Music - Demo Data
// Synthetic music data for the music player

// Genre categories
export const GENRES = [
  { id: 'all', label: 'All', icon: '🎵' },
  { id: 'electronic', label: 'Electronic', icon: '🎧' },
  { id: 'chill', label: 'Chill', icon: '🌊' },
  { id: 'lofi', label: 'Lo-Fi', icon: '🌙' },
  { id: 'ambient', label: 'Ambient', icon: '✨' },
  { id: 'synthwave', label: 'Synthwave', icon: '🌆' },
  { id: 'house', label: 'House', icon: '🏠' },
  { id: 'techno', label: 'Techno', icon: '⚡' },
]

// Demo tracks (synthetic - no real audio files)
export const TRACKS = [
  {
    id: '1',
    title: 'Cosmic Dreams',
    artist: 'Nova Collective',
    album: 'Stellar Journeys',
    duration: 234,
    genre: 'electronic',
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
    genre: 'synthwave',
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
    genre: 'lofi',
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
    genre: 'chill',
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
    genre: 'synthwave',
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
    genre: 'ambient',
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
    genre: 'electronic',
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
    genre: 'lofi',
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
    genre: 'house',
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
    genre: 'techno',
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
    genre: 'ambient',
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
    genre: 'house',
    coverGradient: 'from-orange-500 to-pink-500',
    bpm: 120,
    plays: 1120000,
  },
]

// Playlists
export const PLAYLISTS = [
  {
    id: 'featured',
    title: 'Featured Mix',
    description: 'The best tracks handpicked for you',
    coverGradient: 'from-purple-600 via-pink-600 to-rose-600',
    trackIds: ['1', '2', '3', '4', '5'],
    followers: 12500,
  },
  {
    id: 'chill',
    title: 'Chill Vibes',
    description: 'Relax and unwind with these smooth beats',
    coverGradient: 'from-teal-500 to-cyan-600',
    trackIds: ['3', '4', '8', '6'],
    followers: 8900,
  },
  {
    id: 'night',
    title: 'Late Night Sessions',
    description: 'Perfect for those midnight moments',
    coverGradient: 'from-indigo-600 to-purple-700',
    trackIds: ['2', '5', '7', '10'],
    followers: 6700,
  },
  {
    id: 'focus',
    title: 'Focus Flow',
    description: 'Stay productive with these concentration boosters',
    coverGradient: 'from-amber-500 to-orange-600',
    trackIds: ['3', '6', '8', '11'],
    followers: 15200,
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
  return TRACKS.find(t => t.id === id)
}

export function getTracksByGenre(genreId) {
  if (genreId === 'all') return TRACKS
  return TRACKS.filter(t => t.genre === genreId)
}

export function getPlaylistTracks(playlist) {
  return playlist.trackIds.map(id => getTrackById(id)).filter(Boolean)
}
