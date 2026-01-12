/**
 * AI Studio Service Layer
 * 
 * Handles all API communication and cross-platform operations
 * for AI generation features (images and videos).
 */

import { ApiError, ErrorCodes } from './api'
import { shareFile, downloadFile, copyToClipboard } from './share'
import { setPendingPost } from './pendingPost'

const AI_API_BASE = '/api/ai'

// ==========================================
// Status Checks
// ==========================================

/**
 * Check AI image service status
 */
export async function checkAiStatus() {
  const response = await fetch(`${AI_API_BASE}/image`, {
    method: 'GET',
  })
  
  if (!response.ok) {
    throw new ApiError('Failed to check AI status', response.status, ErrorCodes.SERVER_ERROR)
  }
  
  return response.json()
}

/**
 * Check AI video service status
 */
export async function checkVideoStatus() {
  const response = await fetch(`${AI_API_BASE}/video`, {
    method: 'GET',
  })
  
  if (!response.ok) {
    throw new ApiError('Failed to check video status', response.status, ErrorCodes.SERVER_ERROR)
  }
  
  return response.json()
}

// ==========================================
// Image Generation
// ==========================================

/**
 * Generate an image from a prompt
 */
export async function generateImage(params) {
  const { prompt, style = 'none', size = 'square', negativePrompt = '', seed = null } = params
  
  if (!prompt || prompt.trim().length === 0) {
    throw new ApiError('Prompt is required', 400, ErrorCodes.VALIDATION_ERROR)
  }
  
  const response = await fetch(`${AI_API_BASE}/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt.trim(),
      style,
      size,
      negativePrompt,
      seed,
    }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to generate image',
      response.status,
      data.code || ErrorCodes.SERVER_ERROR,
      data
    )
  }
  
  return data
}

// ==========================================
// Video Generation
// ==========================================

/**
 * Start video generation (async job)
 * @param {Object} params
 * @param {string} params.prompt - Text prompt
 * @param {string} [params.negativePrompt] - What to avoid
 * @param {string} [params.aspectRatio='16:9'] - Aspect ratio
 * @param {number} [params.durationSeconds=5] - Duration in seconds
 * @param {number} [params.fps=24] - Frames per second
 * @param {number} [params.seed] - Seed for reproducibility
 * @returns {Promise<{id: string, status: string, model: string}>}
 */
export async function startVideoGeneration(params) {
  const { 
    prompt, 
    negativePrompt = '', 
    aspectRatio = '16:9', 
    durationSeconds = 5,
    fps = 24,
    seed = null 
  } = params
  
  if (!prompt || prompt.trim().length === 0) {
    throw new ApiError('Prompt is required', 400, ErrorCodes.VALIDATION_ERROR)
  }
  
  const response = await fetch(`${AI_API_BASE}/video`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt.trim(),
      negativePrompt,
      aspectRatio,
      durationSeconds,
      fps,
      seed,
    }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to start video generation',
      response.status,
      data.code || ErrorCodes.SERVER_ERROR,
      data
    )
  }
  
  return data
}

/**
 * Poll video generation status
 * @param {string} predictionId - The prediction ID from startVideoGeneration
 * @returns {Promise<{id: string, status: string, progress: number, videoUrl?: string, error?: string}>}
 */
export async function getVideoStatus(predictionId) {
  const response = await fetch(`${AI_API_BASE}/video?id=${predictionId}`, {
    method: 'GET',
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to get video status',
      response.status,
      data.code || ErrorCodes.SERVER_ERROR,
      data
    )
  }
  
  return data
}

/**
 * Poll video generation until complete or failed
 * @param {string} predictionId 
 * @param {Function} onProgress - Called with status updates
 * @param {number} [pollInterval=2500] - Polling interval in ms
 * @param {number} [maxAttempts=120] - Maximum polling attempts (5 min at 2.5s)
 * @returns {Promise<{videoUrl: string, ...}>}
 */
export async function pollVideoUntilComplete(predictionId, onProgress, pollInterval = 2500, maxAttempts = 120) {
  let attempts = 0
  
  while (attempts < maxAttempts) {
    const status = await getVideoStatus(predictionId)
    
    // Call progress callback
    if (onProgress) {
      onProgress(status)
    }
    
    // Check if done
    if (status.status === 'completed') {
      return status
    }
    
    if (status.status === 'failed') {
      throw new ApiError(
        status.error || 'Video generation failed',
        0,
        ErrorCodes.SERVER_ERROR
      )
    }
    
    if (status.status === 'canceled') {
      throw new ApiError('Video generation was canceled', 0, ErrorCodes.UNKNOWN)
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, pollInterval))
    attempts++
  }
  
  throw new ApiError('Video generation timed out', 0, ErrorCodes.TIMEOUT)
}

/**
 * Start video generation from an image
 * @param {Object} params
 * @param {string} params.imageUrl - Source image URL
 * @param {string} [params.prompt] - Optional motion guidance
 * @param {number} [params.motionBucketId=127] - Motion amount (1-255)
 * @param {number} [params.fps=7] - Frames per second
 */
export async function startImageToVideo(params) {
  const { imageUrl, prompt = '', motionBucketId = 127, fps = 7, seed = null } = params
  
  if (!imageUrl) {
    throw new ApiError('Image URL is required', 400, ErrorCodes.VALIDATION_ERROR)
  }
  
  const response = await fetch(`${AI_API_BASE}/video/from-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageUrl,
      prompt,
      motionBucketId,
      fps,
      seed,
    }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to start image-to-video generation',
      response.status,
      data.code || ErrorCodes.SERVER_ERROR,
      data
    )
  }
  
  return data
}

// ==========================================
// Sharing & Download
// ==========================================

/**
 * Download an image (cross-platform)
 */
export async function downloadImage(imageUrl, filename = 'ai-generated') {
  return downloadFile(imageUrl, filename)
}

/**
 * Download a video (cross-platform)
 */
export async function downloadVideo(videoUrl, filename = 'ai-video') {
  return downloadFile(videoUrl, filename)
}

/**
 * Share image (cross-platform)
 */
export async function shareImage(imageUrl, title = 'AI Generated Image') {
  return shareFile({
    url: imageUrl,
    title,
    mimeType: 'image/webp',
  })
}

/**
 * Share video (cross-platform)
 */
export async function shareVideo(videoUrl, title = 'AI Generated Video') {
  return shareFile({
    url: videoUrl,
    title,
    mimeType: 'video/mp4',
  })
}

/**
 * Copy URL to clipboard
 */
export async function copyImageUrl(url) {
  return copyToClipboard(url)
}

// ==========================================
// Post to Reels
// ==========================================

/**
 * Post image to Reels
 */
export async function postImageToReels({ imageUrl, prompt, caption = '' }) {
  await setPendingPost({
    type: 'ai_image',
    url: imageUrl,
    prompt,
    caption: caption || `AI Generated: ${prompt}`,
    metadata: {
      source: 'ai-studio',
    },
    timestamp: Date.now(),
  })
}

/**
 * Post video to Reels
 */
export async function postVideoToReels({ videoUrl, prompt, caption = '' }) {
  await setPendingPost({
    type: 'ai_video',
    url: videoUrl,
    prompt,
    caption: caption || `AI Generated Video: ${prompt}`,
    metadata: {
      source: 'ai-studio',
      mediaType: 'video',
    },
    timestamp: Date.now(),
  })
}

// Legacy export for backwards compatibility
export const postToReels = postImageToReels
