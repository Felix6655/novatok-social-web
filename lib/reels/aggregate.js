// Reels aggregation layer
// Reuses feed aggregation logic for TikTok-style reel content

import { getFeedItems, FEED_TYPES, formatFeedDate } from '@/lib/feed/aggregate'
import { getUploadedVideos, formatDuration } from '@/lib/reels/storage'

// Re-export for convenience
export { FEED_TYPES, formatFeedDate }

// Add VIDEO type
export const REEL_TYPES = {
  ...FEED_TYPES,
  VIDEO: 'video'
}

/**
 * Reel type configurations
 */
export const REEL_CONFIG = {
  [FEED_TYPES.THINK]: {
    gradient: 'from-yellow-600/80 via-amber-600/60 to-orange-700/80',
    accentColor: 'text-yellow-400',
    bgAccent: 'bg-yellow-500/20',
    borderAccent: 'border-yellow-500/40',
    emoji: '💭'
  },
  [FEED_TYPES.TAROT]: {
    gradient: 'from-purple-600/80 via-violet-600/60 to-pink-700/80',
    accentColor: 'text-purple-400',
    bgAccent: 'bg-purple-500/20',
    borderAccent: 'border-purple-500/40',
    emoji: '✨'
  },
  [FEED_TYPES.HOROSCOPE]: {
    gradient: 'from-blue-600/80 via-cyan-600/60 to-teal-700/80',
    accentColor: 'text-blue-400',
    bgAccent: 'bg-blue-500/20',
    borderAccent: 'border-blue-500/40',
    emoji: '🌟'
  },
  [FEED_TYPES.THINKING]: {
    gradient: 'from-green-600/80 via-emerald-600/60 to-teal-700/80',
    accentColor: 'text-green-400',
    bgAccent: 'bg-green-500/20',
    borderAccent: 'border-green-500/40',
    emoji: '🧠'
  },
  [REEL_TYPES.VIDEO]: {
    gradient: 'from-pink-600/80 via-rose-600/60 to-red-700/80',
    accentColor: 'text-pink-400',
    bgAccent: 'bg-pink-500/20',
    borderAccent: 'border-pink-500/40',
    emoji: '🎬'
  }
}

/**
 * Type labels for display
 */
export const TYPE_LABELS = {
  [FEED_TYPES.THINK]: 'Thought',
  [FEED_TYPES.TAROT]: 'Tarot Reading',
  [FEED_TYPES.HOROSCOPE]: 'Horoscope',
  [FEED_TYPES.THINKING]: 'Brain Challenge'
}

/**
 * Mood labels
 */
export const MOOD_LABELS = {
  release: 'Released',
  vent: 'Vented',
  reflect: 'Reflected',
  hopeful: 'Hopeful',
  neutral: 'Shared'
}

/**
 * Get reel items (uses feed aggregation)
 * @param {number} limit - Maximum items to return
 * @returns {Promise<Array>} Reel items
 */
export async function getReelItems(limit = 50) {
  return await getFeedItems(limit)
}

/**
 * Get video reel items from localStorage metadata
 * @returns {Array} Video reel items
 */
export function getVideoReelItems() {
  const videos = getUploadedVideos()
  
  return videos.map(video => ({
    id: video.id,
    type: REEL_TYPES.VIDEO,
    title: video.fileName,
    summary: `${formatDuration(video.duration)} • Video Reel`,
    metadata: {
      fileName: video.fileName,
      fileType: video.fileType,
      fileSize: video.fileSize,
      duration: video.duration,
      width: video.width,
      height: video.height,
      needsRelink: video.needsRelink
    },
    createdAt: video.createdAt,
    linkTo: null, // Videos don't have a source page
    isVideo: true
  }))
}

/**
 * Get all reel items (videos + content) merged
 * Videos come first (highest priority), then content reels
 * @param {number} limit - Maximum items
 * @returns {Promise<Array>} Merged reel items
 */
export async function getAllReelItems(limit = 50) {
  const videoReels = getVideoReelItems()
  const contentReels = await getReelItems(limit)
  
  // Merge: videos first, then content, all sorted by createdAt desc
  const allReels = [...videoReels, ...contentReels]
  allReels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  
  return allReels.slice(0, limit)
}

/**
 * Get reel config for a type
 * @param {string} type - Reel type
 * @returns {Object} Config object
 */
export function getReelConfig(type) {
  return REEL_CONFIG[type] || REEL_CONFIG[FEED_TYPES.THINK]
}

/**
 * Get type label
 * @param {string} type - Reel type
 * @returns {string} Label
 */
export function getTypeLabel(type) {
  return TYPE_LABELS[type] || 'Content'
}

/**
 * Get mood label
 * @param {string} mood - Mood id
 * @returns {string} Label
 */
export function getMoodLabel(mood) {
  return MOOD_LABELS[mood] || mood
}
