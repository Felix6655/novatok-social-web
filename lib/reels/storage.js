// Storage layer for uploaded video reels
// Uses Supabase when configured, localStorage fallback in dev

import { isSupabaseConfigured } from '@/lib/supabase/client'
import {
  isReelsStorageAvailable,
  listUserReelVideos,
  uploadAndSaveReelVideo,
  deleteReelVideo as deleteReelVideoSupabase,
  getSignedReelUrl
} from '@/lib/reels/supabase'

const STORAGE_KEY = 'novatok_reels_videos'

// Accepted video types
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime']
export const ACCEPTED_EXTENSIONS = ['.mp4', '.webm', '.mov']
export const MAX_FILE_SIZE_MB = 100
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

/**
 * Generate unique video reel ID
 */
function generateVideoId() {
  return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Check if Supabase storage mode is available
 * @returns {Promise<boolean>}
 */
export async function isSupabaseStorageMode() {
  return await isReelsStorageAvailable()
}

/**
 * Validate video file
 * @param {File} file - Video file to validate
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateVideoFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }

  // Check file type
  const isValidType = ACCEPTED_VIDEO_TYPES.includes(file.type) || 
    ACCEPTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext))
  
  if (!isValidType) {
    return { valid: false, error: 'Invalid file type. Please upload MP4, WebM, or MOV files.' }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.` }
  }

  return { valid: true }
}

/**
 * Extract video metadata (duration)
 * @param {File} file - Video file
 * @returns {Promise<{ duration: number, width: number, height: number }>}
 */
export function extractVideoMetadata(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    
    const objectUrl = URL.createObjectURL(file)
    
    video.onloadedmetadata = () => {
      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      }
      URL.revokeObjectURL(objectUrl)
      resolve(metadata)
    }
    
    video.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      resolve({ duration: 0, width: 0, height: 0 })
    }
    
    video.src = objectUrl
  })
}

// =============================================
// LOCALSTORAGE FUNCTIONS (for fallback mode)
// =============================================

/**
 * Get all uploaded video metadata from localStorage
 * @returns {Array} List of video metadata entries
 */
export function getUploadedVideosLocal() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get uploaded videos (auto-detects mode)
 * @returns {Array} List of video metadata entries (localStorage only, sync)
 */
export function getUploadedVideos() {
  // This is the sync version for localStorage fallback
  return getUploadedVideosLocal()
}

/**
 * Get uploaded videos async (checks Supabase first)
 * @returns {Promise<{ videos: Array, isSupabaseMode: boolean }>}
 */
export async function getUploadedVideosAsync() {
  const supabaseMode = await isSupabaseStorageMode()
  
  if (supabaseMode) {
    const videos = await listUserReelVideos()
    // Transform to match expected format
    return {
      videos: videos.map(v => ({
        id: v.id,
        fileName: v.file_name,
        fileType: v.file_type,
        fileSize: v.file_size,
        duration: v.duration,
        width: v.width,
        height: v.height,
        createdAt: v.created_at,
        source: v.source,
        // Supabase mode: no relink needed, we have signed URLs
        needsRelink: false,
        signedUrl: v.signedUrl,
        storagePath: v.storage_path
      })),
      isSupabaseMode: true
    }
  } else {
    return {
      videos: getUploadedVideosLocal(),
      isSupabaseMode: false
    }
  }
}

/**
 * Save video metadata entry (localStorage only)
 * @param {File} file - The video file
 * @param {Object} metadata - Extracted metadata (duration, etc.)
 * @returns {Object} The saved video entry
 */
export function saveVideoMetadata(file, metadata) {
  if (typeof window === 'undefined') return null

  const videos = getUploadedVideosLocal()
  
  const entry = {
    id: generateVideoId(),
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
    duration: metadata.duration || 0,
    width: metadata.width || 0,
    height: metadata.height || 0,
    createdAt: new Date().toISOString(),
    source: 'uploaded',
    caption: metadata.caption || '',
    needsRelink: false // Will be true after page refresh
  }
  
  videos.unshift(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
  
  return entry
}

/**
 * Save recorded video metadata entry (localStorage only)
 * @param {Blob} blob - The recorded video blob
 * @param {Object} metadata - Recording metadata (duration, etc.)
 * @returns {Object} The saved video entry
 */
export function saveRecordedVideoMetadata(blob, metadata) {
  if (typeof window === 'undefined') return null

  const videos = getUploadedVideosLocal()
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  
  const entry = {
    id: generateVideoId(),
    fileName: `recorded_${timestamp}.webm`,
    fileType: blob.type || 'video/webm',
    fileSize: blob.size,
    duration: metadata.duration || 0,
    width: metadata.width || 0,
    height: metadata.height || 0,
    createdAt: new Date().toISOString(),
    source: 'recorded',
    caption: metadata.caption || '',
    needsRelink: false // Will be true after page refresh
  }
  
  videos.unshift(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
  
  return entry
}

/**
 * Update caption for a video
 * @param {string} id - Video ID
 * @param {string} caption - New caption text
 * @returns {boolean} Success
 */
export function updateVideoCaption(id, caption) {
  if (typeof window === 'undefined') return false
  
  const videos = getUploadedVideosLocal()
  const index = videos.findIndex(v => v.id === id)
  
  if (index === -1) return false
  
  videos[index].caption = caption
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
  return true
}

// =============================================
// SUPABASE UPLOAD FUNCTIONS
// =============================================

/**
 * Upload video to Supabase (or localStorage if not configured)
 * @param {File|Blob} fileOrBlob - Video file or blob
 * @param {Object} metadata - Video metadata
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<{ entry: Object, objectUrl?: string, isSupabaseMode: boolean, error?: string }>}
 */
export async function uploadVideo(fileOrBlob, metadata, onProgress) {
  const supabaseMode = await isSupabaseStorageMode()
  
  if (supabaseMode) {
    const { data, error } = await uploadAndSaveReelVideo(fileOrBlob, metadata, onProgress)
    
    if (error) {
      return { entry: null, error, isSupabaseMode: true }
    }
    
    return {
      entry: {
        id: data.id,
        fileName: data.file_name,
        fileType: data.file_type,
        fileSize: data.file_size,
        duration: data.duration,
        width: data.width,
        height: data.height,
        createdAt: data.created_at,
        source: data.source,
        needsRelink: false,
        signedUrl: data.signedUrl,
        storagePath: data.storage_path
      },
      objectUrl: data.signedUrl, // Use signed URL as the playback URL
      isSupabaseMode: true
    }
  } else {
    // localStorage fallback
    const objectUrl = URL.createObjectURL(fileOrBlob)
    const entry = metadata.source === 'recorded'
      ? saveRecordedVideoMetadata(fileOrBlob, metadata)
      : saveVideoMetadata(fileOrBlob, metadata)
    
    return {
      entry,
      objectUrl,
      isSupabaseMode: false
    }
  }
}

/**
 * Delete video (Supabase or localStorage)
 * @param {string} id - Video ID
 * @param {string} storagePath - Storage path (for Supabase)
 * @param {boolean} isSupabaseMode - Whether in Supabase mode
 * @returns {Promise<boolean>}
 */
export async function deleteVideo(id, storagePath, isSupabaseMode) {
  if (isSupabaseMode && storagePath) {
    const { success } = await deleteReelVideoSupabase(id, storagePath)
    return success
  } else {
    return deleteVideoMetadataLocal(id)
  }
}

// =============================================
// LOCALSTORAGE MANAGEMENT
// =============================================

// Recording constants
export const MAX_RECORDING_DURATION = 60 // seconds

/**
 * Check if MediaRecorder is supported
 * @returns {boolean}
 */
export function isMediaRecorderSupported() {
  return typeof window !== 'undefined' && 
    'MediaRecorder' in window && 
    'mediaDevices' in navigator &&
    'getUserMedia' in navigator.mediaDevices
}

/**
 * Get available video input devices
 * @returns {Promise<Array>}
 */
export async function getVideoDevices() {
  if (typeof window === 'undefined') return []
  try {
    const devices = await navigator.mediaDevices.enumerateDevices()
    return devices.filter(d => d.kind === 'videoinput')
  } catch {
    return []
  }
}

/**
 * Mark all videos as needing relink (called on page load)
 * Videos need to be re-linked because objectURLs don't persist across sessions
 * Note: Only applies to localStorage mode
 */
export function markVideosAsNeedingRelink() {
  if (typeof window === 'undefined') return
  
  const videos = getUploadedVideosLocal()
  const updated = videos.map(v => ({ ...v, needsRelink: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Update video entry to mark as relinked
 * @param {string} id - Video ID
 */
export function markVideoAsRelinked(id) {
  if (typeof window === 'undefined') return
  
  const videos = getUploadedVideosLocal()
  const updated = videos.map(v => 
    v.id === id ? { ...v, needsRelink: false } : v
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Delete video metadata entry (localStorage only)
 * @param {string} id - Video ID to delete
 * @returns {boolean} Success
 */
export function deleteVideoMetadataLocal(id) {
  if (typeof window === 'undefined') return false
  
  const videos = getUploadedVideosLocal()
  const filtered = videos.filter(v => v.id !== id)
  
  if (filtered.length === videos.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

// Keep old name for backwards compatibility
export const deleteVideoMetadata = deleteVideoMetadataLocal

/**
 * Format video duration for display
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration (MM:SS)
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}
