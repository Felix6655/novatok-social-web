// LiveKit configuration helper
// Checks if LiveKit is configured and provides helpers

/**
 * Check if LiveKit server-side credentials are configured
 * (Only call this on server-side)
 * @returns {boolean}
 */
export function isLiveKitServerConfigured() {
  return !!(
    process.env.LIVEKIT_URL &&
    process.env.LIVEKIT_API_KEY &&
    process.env.LIVEKIT_API_SECRET
  )
}

/**
 * Get LiveKit URL for client
 * Uses NEXT_PUBLIC_LIVEKIT_URL or LIVEKIT_URL
 * @returns {string | null}
 */
export function getLiveKitUrl() {
  return process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL || null
}

/**
 * Check if LiveKit client config is available
 * @returns {boolean}
 */
export function isLiveKitClientConfigured() {
  return !!(process.env.NEXT_PUBLIC_LIVEKIT_URL || process.env.LIVEKIT_URL)
}
