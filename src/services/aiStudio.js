/**
 * AI Studio Service Layer
 * 
 * Handles all API communication for AI generation features
 * Uses the central API client patterns
 */

import { ApiError, ErrorCodes } from './api'

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
 * Download an image from URL
 * @param {string} imageUrl - URL of the image
 * @param {string} [filename] - Optional filename
 */
export async function downloadImage(imageUrl, filename = 'ai-generated') {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    
    // Determine extension from content type
    const contentType = response.headers.get('content-type') || 'image/webp'
    const ext = contentType.split('/')[1] || 'webp'
    
    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.${ext}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('[AI Studio] Download failed:', error)
    throw new ApiError('Failed to download image', 0, ErrorCodes.NETWORK_ERROR)
  }
}

/**
 * Share image using Web Share API (if available)
 * @param {string} imageUrl - URL of the image
 * @param {string} title - Share title
 * @returns {Promise<boolean>} - True if shared, false if not supported
 */
export async function shareImage(imageUrl, title = 'AI Generated Image') {
  if (!navigator.share) {
    return false
  }
  
  try {
    // Try to share as file first
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const file = new File([blob], 'ai-image.webp', { type: blob.type })
    
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        files: [file],
      })
    } else {
      // Fallback to sharing URL
      await navigator.share({
        title,
        url: imageUrl,
      })
    }
    
    return true
  } catch (error) {
    if (error.name === 'AbortError') {
      // User cancelled - not an error
      return false
    }
    console.error('[AI Studio] Share failed:', error)
    throw error
  }
}
