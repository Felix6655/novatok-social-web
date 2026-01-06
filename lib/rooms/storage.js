// Storage layer for Rooms feature
// Uses localStorage for room history (Phase 0 - UI only)

const RECENT_ROOMS_KEY = 'novatok_recent_rooms'
const ROOM_MESSAGES_PREFIX = 'novatok_room_messages_'
const MAX_RECENT_ROOMS = 10

/**
 * Generate a short random room ID (8 chars)
 * @returns {string}
 */
export function generateRoomId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

/**
 * Get recent rooms from localStorage
 * @returns {Array<{ id: string, name: string, lastJoined: string }>}
 */
export function getRecentRooms() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(RECENT_ROOMS_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Add or update a room in recent history
 * @param {string} id - Room ID
 * @param {string} name - Room name (optional)
 */
export function addRecentRoom(id, name = '') {
  if (typeof window === 'undefined') return
  
  const rooms = getRecentRooms()
  
  // Remove if already exists
  const filtered = rooms.filter(r => r.id !== id)
  
  // Add to front
  filtered.unshift({
    id,
    name: name || `Room ${id}`,
    lastJoined: new Date().toISOString()
  })
  
  // Keep only last N rooms
  const trimmed = filtered.slice(0, MAX_RECENT_ROOMS)
  
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(trimmed))
}

/**
 * Remove a room from recent history
 * @param {string} id - Room ID
 */
export function removeRecentRoom(id) {
  if (typeof window === 'undefined') return
  
  const rooms = getRecentRooms()
  const filtered = rooms.filter(r => r.id !== id)
  localStorage.setItem(RECENT_ROOMS_KEY, JSON.stringify(filtered))
}

/**
 * Get room info by ID from recent rooms
 * @param {string} id - Room ID
 * @returns {{ id: string, name: string, lastJoined: string } | null}
 */
export function getRoomInfo(id) {
  const rooms = getRecentRooms()
  return rooms.find(r => r.id === id) || null
}

/**
 * Get messages for a room
 * @param {string} roomId - Room ID
 * @returns {Array<{ id: string, type: 'user' | 'system', text: string, sender?: string, timestamp: string }>}
 */
export function getRoomMessages(roomId) {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(ROOM_MESSAGES_PREFIX + roomId)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Add a message to a room
 * @param {string} roomId - Room ID
 * @param {{ type: 'user' | 'system', text: string, sender?: string }} message
 * @returns {Object} The saved message with id and timestamp
 */
export function addRoomMessage(roomId, message) {
  if (typeof window === 'undefined') return null
  
  const messages = getRoomMessages(roomId)
  const newMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    ...message,
    timestamp: new Date().toISOString()
  }
  
  messages.push(newMessage)
  
  // Keep last 100 messages per room
  const trimmed = messages.slice(-100)
  localStorage.setItem(ROOM_MESSAGES_PREFIX + roomId, JSON.stringify(trimmed))
  
  return newMessage
}

/**
 * Clear messages for a room
 * @param {string} roomId - Room ID
 */
export function clearRoomMessages(roomId) {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ROOM_MESSAGES_PREFIX + roomId)
}

/**
 * Format timestamp for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string}
 */
export function formatMessageTime(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

/**
 * Format last joined time for display
 * @param {string} timestamp - ISO timestamp
 * @returns {string}
 */
export function formatLastJoined(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
