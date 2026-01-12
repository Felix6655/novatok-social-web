/**
 * Pending Post Store
 * 
 * Cross-platform store for passing content between features
 * (e.g., AI Studio -> Reels)
 * 
 * Uses the storage adapter for persistence across page navigations.
 */

import { getItem, setItem, removeItem } from './storage'

const PENDING_POST_KEY = 'novatok_pending_post'

/**
 * @typedef {Object} PendingPost
 * @property {'ai_image' | 'ai_video' | 'upload'} type - Type of content
 * @property {string} url - URL of the content
 * @property {string} [prompt] - AI prompt (if applicable)
 * @property {string} [caption] - Pre-filled caption
 * @property {Object} [metadata] - Additional metadata
 * @property {number} timestamp - When the post was created
 */

/**
 * Set a pending post to be picked up by another feature
 * @param {PendingPost} post 
 * @returns {Promise<void>}
 */
export async function setPendingPost(post) {
  const pendingPost = {
    ...post,
    timestamp: post.timestamp || Date.now(),
  }
  await setItem(PENDING_POST_KEY, pendingPost)
}

/**
 * Get the pending post (if any)
 * @returns {Promise<PendingPost | null>}
 */
export async function getPendingPost() {
  const post = await getItem(PENDING_POST_KEY, null)
  
  // Check if post is stale (older than 1 hour)
  if (post && post.timestamp) {
    const age = Date.now() - post.timestamp
    const ONE_HOUR = 60 * 60 * 1000
    if (age > ONE_HOUR) {
      // Auto-clear stale posts
      await clearPendingPost()
      return null
    }
  }
  
  return post
}

/**
 * Clear the pending post
 * @returns {Promise<void>}
 */
export async function clearPendingPost() {
  await removeItem(PENDING_POST_KEY)
}

/**
 * Check if there's a pending post
 * @returns {Promise<boolean>}
 */
export async function hasPendingPost() {
  const post = await getPendingPost()
  return post !== null
}

/**
 * Consume the pending post (get and clear in one operation)
 * @returns {Promise<PendingPost | null>}
 */
export async function consumePendingPost() {
  const post = await getPendingPost()
  if (post) {
    await clearPendingPost()
  }
  return post
}

export default {
  setPendingPost,
  getPendingPost,
  clearPendingPost,
  hasPendingPost,
  consumePendingPost,
}
