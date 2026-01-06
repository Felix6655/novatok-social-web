// Reactions storage for Reels (localStorage only)
// Stores reaction counts per reel ID

const REACTIONS_KEY = 'novatok_reels_reactions'

// Available reaction types
export const REACTION_TYPES = {
  LIKE: 'like',
  FUNNY: 'funny',
  FIRE: 'fire'
}

export const REACTION_EMOJIS = {
  [REACTION_TYPES.LIKE]: '❤️',
  [REACTION_TYPES.FUNNY]: '😂',
  [REACTION_TYPES.FIRE]: '🔥'
}

/**
 * Get all reactions data from localStorage
 * @returns {Object} Map of reelId -> { like: count, funny: count, fire: count, userReaction: string|null }
 */
export function getAllReactions() {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(REACTIONS_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Get reactions for a specific reel
 * @param {string} reelId - Reel ID
 * @returns {{ like: number, funny: number, fire: number, userReaction: string|null }}
 */
export function getReelReactions(reelId) {
  const all = getAllReactions()
  return all[reelId] || {
    like: 0,
    funny: 0,
    fire: 0,
    userReaction: null
  }
}

/**
 * Toggle a reaction for a reel
 * @param {string} reelId - Reel ID
 * @param {string} reactionType - one of REACTION_TYPES
 * @returns {{ added: boolean, reactions: Object }} Result with updated reactions
 */
export function toggleReaction(reelId, reactionType) {
  if (typeof window === 'undefined') return { added: false, reactions: {} }
  
  const all = getAllReactions()
  const current = all[reelId] || {
    like: 0,
    funny: 0,
    fire: 0,
    userReaction: null
  }
  
  let added = false
  
  // If user already has this reaction, remove it
  if (current.userReaction === reactionType) {
    current[reactionType] = Math.max(0, current[reactionType] - 1)
    current.userReaction = null
    added = false
  } else {
    // If user had a different reaction, remove it first
    if (current.userReaction) {
      current[current.userReaction] = Math.max(0, current[current.userReaction] - 1)
    }
    // Add new reaction
    current[reactionType] = (current[reactionType] || 0) + 1
    current.userReaction = reactionType
    added = true
  }
  
  all[reelId] = current
  localStorage.setItem(REACTIONS_KEY, JSON.stringify(all))
  
  return { added, reactions: current }
}

/**
 * Format reaction count for display
 * @param {number} count - Reaction count
 * @returns {string}
 */
export function formatReactionCount(count) {
  if (!count || count === 0) return ''
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}
