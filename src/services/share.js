/**
 * Cross-Platform Share Service
 * 
 * Provides sharing functionality that works on:
 * - Web: navigator.share (with clipboard fallback)
 * - React Native: react-native Share API
 * - Expo: expo-sharing
 */

// Detect platform
const isNative = typeof navigator !== 'undefined' && navigator.product === 'ReactNative'

// Native share module references (lazy loaded)
let NativeShare = null
let ExpoSharing = null

/**
 * Initialize native share module (call in app entry if using React Native)
 * @param {Object} options
 * @param {Object} [options.Share] - React Native Share from 'react-native'
 * @param {Object} [options.Sharing] - Expo Sharing from 'expo-sharing'
 */
export function initNativeShare(options = {}) {
  if (options.Share) NativeShare = options.Share
  if (options.Sharing) ExpoSharing = options.Sharing
}

/**
 * Check if sharing is available on this platform
 * @returns {Promise<boolean>}
 */
export async function isShareAvailable() {
  if (isNative) {
    if (ExpoSharing) {
      return ExpoSharing.isAvailableAsync()
    }
    return !!NativeShare
  }
  
  // Web
  return typeof navigator !== 'undefined' && !!navigator.share
}

/**
 * Share text content
 * @param {Object} options
 * @param {string} [options.title] - Share title
 * @param {string} [options.message] - Share message/text
 * @param {string} [options.url] - URL to share
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function shareText({ title = '', message = '', url = '' }) {
  // React Native
  if (isNative && NativeShare) {
    try {
      const result = await NativeShare.share({
        title,
        message: message || url,
        url, // iOS only
      })
      return {
        success: result.action !== NativeShare.dismissedAction,
        method: 'native',
      }
    } catch (error) {
      console.error('[Share] Native share failed:', error)
      return { success: false, method: 'native' }
    }
  }
  
  // Web - try navigator.share first
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title,
        text: message,
        url,
      })
      return { success: true, method: 'web-share' }
    } catch (error) {
      if (error.name === 'AbortError') {
        // User cancelled - not an error
        return { success: false, method: 'web-share' }
      }
      console.warn('[Share] Web Share API failed, falling back to clipboard:', error)
    }
  }
  
  // Fallback: copy to clipboard
  return copyToClipboard(url || message || title)
}

/**
 * Share a file (image, video, etc.)
 * @param {Object} options
 * @param {string} options.url - URL of the file to share
 * @param {string} [options.title] - Share title
 * @param {string} [options.mimeType] - MIME type of the file
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function shareFile({ url, title = '', mimeType = 'image/png' }) {
  // Expo Sharing (best for files on native)
  if (isNative && ExpoSharing) {
    try {
      const isAvailable = await ExpoSharing.isAvailableAsync()
      if (isAvailable) {
        await ExpoSharing.shareAsync(url, {
          mimeType,
          dialogTitle: title,
        })
        return { success: true, method: 'expo-sharing' }
      }
    } catch (error) {
      console.error('[Share] Expo sharing failed:', error)
    }
  }
  
  // React Native Share (fallback for native)
  if (isNative && NativeShare) {
    try {
      const result = await NativeShare.share({
        title,
        url,
      })
      return {
        success: result.action !== NativeShare.dismissedAction,
        method: 'native',
      }
    } catch (error) {
      console.error('[Share] Native share failed:', error)
    }
  }
  
  // Web - try to share as file if supported
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      // Try to fetch and share as file
      const response = await fetch(url)
      const blob = await response.blob()
      const fileName = title || 'shared-file'
      const extension = mimeType.split('/')[1] || 'png'
      const file = new File([blob], `${fileName}.${extension}`, { type: mimeType })
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title,
          files: [file],
        })
        return { success: true, method: 'web-share-file' }
      }
      
      // Fallback to sharing URL
      await navigator.share({
        title,
        url,
      })
      return { success: true, method: 'web-share-url' }
    } catch (error) {
      if (error.name === 'AbortError') {
        return { success: false, method: 'web-share' }
      }
      console.warn('[Share] Web file share failed:', error)
    }
  }
  
  // Final fallback: copy URL
  return copyToClipboard(url)
}

/**
 * Copy text to clipboard
 * @param {string} text 
 * @returns {Promise<{success: boolean, method: string}>}
 */
export async function copyToClipboard(text) {
  if (typeof navigator === 'undefined') {
    return { success: false, method: 'none' }
  }
  
  // Modern clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return { success: true, method: 'clipboard' }
    } catch (error) {
      console.warn('[Share] Clipboard API failed:', error)
    }
  }
  
  // Legacy fallback
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()
    
    const success = document.execCommand('copy')
    document.body.removeChild(textArea)
    
    return { success, method: 'execCommand' }
  } catch (error) {
    console.error('[Share] Legacy clipboard failed:', error)
    return { success: false, method: 'none' }
  }
}

/**
 * Download a file (web only, native uses share)
 * @param {string} url - URL of the file
 * @param {string} [filename] - Desired filename
 * @returns {Promise<{success: boolean}>}
 */
export async function downloadFile(url, filename = 'download') {
  // On native, downloading is typically done via sharing
  if (isNative) {
    return shareFile({ url, title: filename })
  }
  
  // Web download
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    
    const contentType = response.headers.get('content-type') || 'application/octet-stream'
    const extension = contentType.split('/')[1] || 'bin'
    
    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename.includes('.') ? filename : `${filename}.${extension}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
    
    return { success: true }
  } catch (error) {
    console.error('[Share] Download failed:', error)
    return { success: false }
  }
}

export default {
  isShareAvailable,
  shareText,
  shareFile,
  copyToClipboard,
  downloadFile,
  initNativeShare,
}
