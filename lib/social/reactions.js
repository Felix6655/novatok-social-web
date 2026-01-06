// Social reactions storage (localStorage)
// Handles likes and reactions for social posts

const LIKES_KEY = 'novatok_social_likes'
const REACTIONS_KEY = 'novatok_social_reactions'

// Reaction types
export const REACTION_TYPES = {
  LIKE: 'like',
  LOVE: 'love',
  FIRE: 'fire',
  SAD: 'sad',
  WOW: 'wow'
}

export const REACTION_EMOJIS = {
  [REACTION_TYPES.LIKE]: '👍',
  [REACTION_TYPES.LOVE]: '❤️',
  [REACTION_TYPES.FIRE]: '🔥',
  [REACTION_TYPES.SAD]: '😢',
  [REACTION_TYPES.WOW]: '😮'
}

/**
 * Get all likes from localStorage
 * @returns {Object} Map of postId -> boolean
 */
export function getAllLikes() {
  if (typeof window === 'undefined') return {}
  try {
    const stored = localStorage.getItem(LIKES_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Check if a post is liked
 * @param {string} postId
 * @returns {boolean}
 */
export function isPostLiked(postId) {
  const likes = getAllLikes()
  return !!likes[postId]
}

/**
 * Toggle like on a post
 * @param {string} postId
 * @returns {boolean} New like state
 */
export function toggleLike(postId) {
  if (typeof window === 'undefined') return false
  
  const likes = getAllLikes()
  const newState = !likes[postId]
  
  if (newState) {
    likes[postId] = true
  } else {
    delete likes[postId]
  }
  
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes))
  return newState
}

/**
 * Get like count adjustment (for display)
 * If user has liked, we add 1 to base count
 * @param {string} postId
 * @param {number} baseCount
 * @returns {number}
 */
export function getAdjustedLikeCount(postId, baseCount) {
  const isLiked = isPostLiked(postId)
  // The base count already includes the "mock" likes
  // We just return it as-is since this is demo data
  return baseCount
}

/**
 * Get all reactions from localStorage
 * @returns {Object}
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
 * Get user's reaction for a post
 * @param {string} postId
 * @returns {string|null}
 */
export function getUserReaction(postId) {
  const reactions = getAllReactions()
  return reactions[postId] || null
}

/**
 * Set reaction for a post
 * @param {string} postId
 * @param {string|null} reactionType
 */
export function setReaction(postId, reactionType) {
  if (typeof window === 'undefined') return
  
  const reactions = getAllReactions()
  
  if (reactionType) {
    reactions[postId] = reactionType
  } else {
    delete reactions[postId]
  }
  
  localStorage.setItem(REACTIONS_KEY, JSON.stringify(reactions))
}

/**
 * Format count for display
 * @param {number} count
 * @returns {string}
 */
export function formatCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}
