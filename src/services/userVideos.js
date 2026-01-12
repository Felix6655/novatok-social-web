/**
 * User Videos Service Layer
 * 
 * Handles storage for user-recorded videos from Go Live Lite.
 * Uses storage adapter for cross-platform compatibility.
 */

import storage from './storage'
import { setPendingPost } from './pendingPost'

const USER_VIDEOS_KEY = 'novatok_user_videos'
const MAX_USER_VIDEOS = 20

// ==========================================
// Storage Functions
// ==========================================

/**
 * Load all user videos
 * @returns {Promise<Array>}
 */
export async function loadUserVideos() {
  try {
    const data = await storage.getItem(USER_VIDEOS_KEY, [])
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('[userVideos] Load failed:', error)
    return []
  }
}

/**
 * Save user videos array
 * @param {Array} videos
 */
export async function saveUserVideos(videos) {
  try {
    const truncated = videos.slice(0, MAX_USER_VIDEOS)
    await storage.setItem(USER_VIDEOS_KEY, truncated)
  } catch (error) {
    console.error('[userVideos] Save failed:', error)
  }
}

/**
 * Add a new user video
 * @param {Object} video - { id, blobUrl, caption, duration, createdAt }
 * @returns {Promise<Object>} The saved video object
 */
export async function addUserVideo(video) {
  const videos = await loadUserVideos()
  
  const newVideo = {
    id: video.id || `uv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    blobUrl: video.blobUrl,
    caption: video.caption || '',
    duration: video.duration || 0,
    createdAt: video.createdAt || new Date().toISOString(),
  }
  
  const updated = [newVideo, ...videos].slice(0, MAX_USER_VIDEOS)
  await saveUserVideos(updated)
  
  return newVideo
}

/**
 * Delete a user video
 * @param {string} id
 */
export async function deleteUserVideo(id) {
  const videos = await loadUserVideos()
  const filtered = videos.filter(v => v.id !== id)
  await saveUserVideos(filtered)
}

/**
 * Clear all user videos
 */
export async function clearUserVideos() {
  await storage.setItem(USER_VIDEOS_KEY, [])
}

// ==========================================
// Post to Reels
// ==========================================

/**
 * Post a recorded video to Reels via pendingPost
 * @param {Object} params - { videoUrl, caption, duration }
 */
export async function postVideoToReels({ videoUrl, caption, duration }) {
  await setPendingPost({
    type: 'user_video',
    url: videoUrl,
    caption: caption || '',
    duration: duration || 0,
    createdAt: new Date().toISOString(),
    metadata: {
      source: 'go-live-lite',
    },
  })
}

// ==========================================
// Blob Management
// ==========================================

// In-memory store for blob URLs (they don't persist across page reloads)
const blobStore = new Map()

/**
 * Store a blob and return a reference ID
 * Note: Blob URLs are session-only, they won't work after page reload
 * @param {Blob} blob
 * @returns {string} blobUrl
 */
export function storeBlobUrl(blob) {
  const url = URL.createObjectURL(blob)
  blobStore.set(url, blob)
  return url
}

/**
 * Revoke a blob URL to free memory
 * @param {string} url
 */
export function revokeBlobUrl(url) {
  if (blobStore.has(url)) {
    URL.revokeObjectURL(url)
    blobStore.delete(url)
  }
}

/**
 * Get blob from URL
 * @param {string} url
 * @returns {Blob|null}
 */
export function getBlobFromUrl(url) {
  return blobStore.get(url) || null
}
