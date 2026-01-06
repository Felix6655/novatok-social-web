// Storage layer for Go Live feature
// Uses localStorage for demo session storage

const LIVE_SESSIONS_KEY = 'novatok_live_sessions'
const LIVE_MESSAGES_PREFIX = 'novatok_live_messages_'

/**
 * Generate a unique session ID
 * @returns {string}
 */
export function generateSessionId() {
  return `live_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`
}

/**
 * Get all live sessions from localStorage
 * @returns {Array}
 */
export function getLiveSessions() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(LIVE_SESSIONS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Get a specific live session by ID
 * @param {string} sessionId
 * @returns {Object|null}
 */
export function getLiveSession(sessionId) {
  const sessions = getLiveSessions()
  return sessions.find(s => s.id === sessionId) || null
}

/**
 * Create a new live session
 * @param {{ title: string, hostName: string }} params
 * @returns {Object} The created session
 */
export function createLiveSession({ title, hostName }) {
  if (typeof window === 'undefined') return null
  
  const sessions = getLiveSessions()
  
  const session = {
    id: generateSessionId(),
    title: title || 'Live Stream',
    hostName: hostName || 'Anonymous',
    status: 'live', // 'live' | 'ended'
    startedAt: new Date().toISOString(),
    endedAt: null,
    viewerCount: 0,
    peakViewers: 0
  }
  
  sessions.unshift(session)
  localStorage.setItem(LIVE_SESSIONS_KEY, JSON.stringify(sessions))
  
  return session
}

/**
 * Update a live session
 * @param {string} sessionId
 * @param {Object} updates
 * @returns {Object|null} Updated session
 */
export function updateLiveSession(sessionId, updates) {
  if (typeof window === 'undefined') return null
  
  const sessions = getLiveSessions()
  const index = sessions.findIndex(s => s.id === sessionId)
  
  if (index === -1) return null
  
  sessions[index] = { ...sessions[index], ...updates }
  localStorage.setItem(LIVE_SESSIONS_KEY, JSON.stringify(sessions))
  
  return sessions[index]
}

/**
 * End a live session
 * @param {string} sessionId
 * @returns {Object|null} Updated session
 */
export function endLiveSession(sessionId) {
  return updateLiveSession(sessionId, {
    status: 'ended',
    endedAt: new Date().toISOString()
  })
}

/**
 * Get messages for a live session
 * @param {string} sessionId
 * @returns {Array}
 */
export function getLiveMessages(sessionId) {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(LIVE_MESSAGES_PREFIX + sessionId)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Add a message to a live session
 * @param {string} sessionId
 * @param {{ type: 'user' | 'system', text: string, sender?: string }} message
 * @returns {Object} The saved message
 */
export function addLiveMessage(sessionId, message) {
  if (typeof window === 'undefined') return null
  
  const messages = getLiveMessages(sessionId)
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    ...message,
    timestamp: new Date().toISOString()
  }
  
  messages.push(newMessage)
  
  // Keep last 200 messages
  const trimmed = messages.slice(-200)
  localStorage.setItem(LIVE_MESSAGES_PREFIX + sessionId, JSON.stringify(trimmed))
  
  return newMessage
}

/**
 * Format timestamp for display
 * @param {string} timestamp
 * @returns {string}
 */
export function formatLiveTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Calculate live duration
 * @param {string} startedAt - ISO timestamp
 * @returns {string} Formatted duration (HH:MM:SS)
 */
export function formatLiveDuration(startedAt) {
  const start = new Date(startedAt)
  const now = new Date()
  const diffMs = now - start
  const diffSecs = Math.floor(diffMs / 1000)
  
  const hours = Math.floor(diffSecs / 3600)
  const mins = Math.floor((diffSecs % 3600) / 60)
  const secs = diffSecs % 60
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format viewer count
 * @param {number} count
 * @returns {string}
 */
export function formatViewerCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}
