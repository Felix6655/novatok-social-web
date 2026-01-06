// Storage layer for uploaded video reels
// Uses localStorage to persist metadata (not the actual video files)

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

/**
 * Get all uploaded video metadata
 * @returns {Array} List of video metadata entries
 */
export function getUploadedVideos() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Save video metadata entry
 * @param {File} file - The video file
 * @param {Object} metadata - Extracted metadata (duration, etc.)
 * @returns {Object} The saved video entry
 */
export function saveVideoMetadata(file, metadata) {
  if (typeof window === 'undefined') return null

  const videos = getUploadedVideos()
  
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
    needsRelink: false // Will be true after page refresh
  }
  
  videos.unshift(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
  
  return entry
}

/**
 * Save recorded video metadata entry
 * @param {Blob} blob - The recorded video blob
 * @param {Object} metadata - Recording metadata (duration, etc.)
 * @returns {Object} The saved video entry
 */
export function saveRecordedVideoMetadata(blob, metadata) {
  if (typeof window === 'undefined') return null

  const videos = getUploadedVideos()
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
    needsRelink: false // Will be true after page refresh
  }
  
  videos.unshift(entry)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(videos))
  
  return entry
}

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
 */
export function markVideosAsNeedingRelink() {
  if (typeof window === 'undefined') return
  
  const videos = getUploadedVideos()
  const updated = videos.map(v => ({ ...v, needsRelink: true }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Update video entry to mark as relinked
 * @param {string} id - Video ID
 */
export function markVideoAsRelinked(id) {
  if (typeof window === 'undefined') return
  
  const videos = getUploadedVideos()
  const updated = videos.map(v => 
    v.id === id ? { ...v, needsRelink: false } : v
  )
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

/**
 * Delete video metadata entry
 * @param {string} id - Video ID to delete
 * @returns {boolean} Success
 */
export function deleteVideoMetadata(id) {
  if (typeof window === 'undefined') return false
  
  const videos = getUploadedVideos()
  const filtered = videos.filter(v => v.id !== id)
  
  if (filtered.length === videos.length) return false
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return true
}

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
