/**
 * AI Studio Service Layer
 * 
 * Handles all API communication and cross-platform operations
 * for AI generation features.
 */

import { ApiError, ErrorCodes } from './api'
import { shareFile, downloadFile, copyToClipboard } from './share'
import { setPendingPost } from './pendingPost'

const AI_API_BASE = '/api/ai'

/**
 * Check AI service status
 * @returns {Promise<{status: string, model: string, supportedStyles: string[], supportedSizes: string[]}>}
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
 * Generate an image from a prompt
 * 
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - The text prompt
 * @param {string} [params.style='none'] - Style preset
 * @param {string} [params.size='square'] - Size preset
 * @param {string} [params.negativePrompt=''] - What to avoid
 * @param {number} [params.seed] - Seed for reproducibility
 * @returns {Promise<{success: boolean, imageUrl: string, prompt: string, enhancedPrompt: string, style: string, size: string, model: string, generatedAt: string}>}
 */
export async function generateImage(params) {
  const { prompt, style = 'none', size = 'square', negativePrompt = '', seed = null } = params
  
  if (!prompt || prompt.trim().length === 0) {
    throw new ApiError('Prompt is required', 400, ErrorCodes.VALIDATION_ERROR)
  }
  
  const response = await fetch(`${AI_API_BASE}/image`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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

/**
 * Download an image (cross-platform)
 * @param {string} imageUrl - URL of the image
 * @param {string} [filename] - Optional filename
 * @returns {Promise<{success: boolean}>}
 */
export async function downloadImage(imageUrl, filename = 'ai-generated') {
  return downloadFile(imageUrl, filename)
}

/**
 * Share image (cross-platform)
 * Uses native share on mobile, Web Share API or clipboard on web
 * @param {string} imageUrl - URL of the image
 * @param {string} [title] - Share title
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function shareImage(imageUrl, title = 'AI Generated Image') {
  return shareFile({
    url: imageUrl,
    title,
    mimeType: 'image/webp',
  })
}

/**
 * Copy image URL to clipboard
 * @param {string} imageUrl - URL to copy
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function copyImageUrl(imageUrl) {
  return copyToClipboard(imageUrl)
}

/**
 * Post to Reels (cross-platform)
 * Stores the image in pendingPost store for Reels to pick up
 * @param {Object} params
 * @param {string} params.imageUrl - URL of the image
 * @param {string} params.prompt - The prompt used to generate
 * @param {string} [params.caption] - Optional pre-filled caption
 * @returns {Promise<void>}
 */
export async function postToReels({ imageUrl, prompt, caption = '' }) {
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
