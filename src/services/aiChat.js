/**
 * AI Chat Service Layer
 * 
 * Handles chat API communication and conversation persistence.
 * Uses storage adapter for cross-platform compatibility.
 */

import storage from './storage'

const AI_CHAT_API = '/api/ai/chat'
const STORAGE_PREFIX = 'novatok_chat_'
const MAX_STORED_MESSAGES = 50
const MAX_API_MESSAGES = 20

// ==========================================
// API Functions
// ==========================================

/**
 * Check AI chat service status
 * @returns {Promise<{ ok: boolean, configured: boolean }>}
 */
export async function checkChatStatus() {
  try {
    const response = await fetch(AI_CHAT_API)
    const data = await response.json()
    return data
  } catch (error) {
    console.error('[aiChat] Status check failed:', error)
    return { ok: false, configured: false }
  }
}

/**
 * Send a chat message and get AI response
 * @param {Object} params
 * @param {string} params.persona - 'creative' | 'coach' | 'expert'
 * @param {Array} params.messages - Message history
 * @param {string} [params.language] - Optional language code
 * @returns {Promise<{ ok: boolean, message?: { role: string, content: string }, error?: { code: string, message: string } }>}
 */
export async function sendChatMessage({ persona, messages, language }) {
  try {
    // Only send last N messages to API
    const recentMessages = messages.slice(-MAX_API_MESSAGES).map(m => ({
      role: m.role,
      content: m.content,
    }))

    const response = await fetch(AI_CHAT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        persona,
        messages: recentMessages,
        language,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[aiChat] Send message failed:', error)
    return {
      ok: false,
      error: {
        code: 'NETWORK_ERROR',
        message: 'Failed to connect to AI service.',
      },
    }
  }
}

// ==========================================
// Storage Functions
// ==========================================

/**
 * Get storage key for a persona
 */
function getStorageKey(persona) {
  return `${STORAGE_PREFIX}${persona}`
}

/**
 * Load conversation for a persona
 * @param {string} persona
 * @returns {Promise<{ messages: Array, updatedAt: string } | null>}
 */
export async function loadConversation(persona) {
  try {
    const data = await storage.getItem(getStorageKey(persona))
    if (data && Array.isArray(data.messages)) {
      return {
        messages: data.messages,
        updatedAt: data.updatedAt || new Date().toISOString(),
      }
    }
    return null
  } catch (error) {
    console.error('[aiChat] Load conversation failed:', error)
    return null
  }
}

/**
 * Save conversation for a persona
 * @param {string} persona
 * @param {Array} messages
 * @returns {Promise<void>}
 */
export async function saveConversation(persona, messages) {
  try {
    // Truncate to max stored messages
    const truncatedMessages = messages.slice(-MAX_STORED_MESSAGES)
    
    await storage.setItem(getStorageKey(persona), {
      messages: truncatedMessages,
      updatedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[aiChat] Save conversation failed:', error)
  }
}

/**
 * Clear conversation for a persona
 * @param {string} persona
 * @returns {Promise<void>}
 */
export async function clearConversation(persona) {
  try {
    await storage.removeItem(getStorageKey(persona))
  } catch (error) {
    console.error('[aiChat] Clear conversation failed:', error)
  }
}

/**
 * Get all saved conversations (for history view)
 * @returns {Promise<Array<{ persona: string, messageCount: number, updatedAt: string }>>}
 */
export async function getAllConversations() {
  const personas = ['creative', 'coach', 'expert']
  const conversations = []

  for (const persona of personas) {
    const data = await loadConversation(persona)
    if (data && data.messages.length > 0) {
      conversations.push({
        persona,
        messageCount: data.messages.length,
        updatedAt: data.updatedAt,
        preview: getConversationPreview(data.messages),
      })
    }
  }

  // Sort by most recent
  return conversations.sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Get a preview of the conversation (first user message)
 */
function getConversationPreview(messages) {
  const firstUserMsg = messages.find(m => m.role === 'user')
  if (!firstUserMsg) return ''
  const content = firstUserMsg.content
  return content.length > 50 ? content.slice(0, 50) + '...' : content
}

/**
 * Format timestamp for display
 */
export function formatChatTime(timestamp) {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`

  return date.toLocaleDateString()
}

/**
 * Validate message input
 * @param {string} content
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateMessageInput(content) {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Message cannot be empty' }
  }
  if (content.length > 2000) {
    return { valid: false, error: 'Message is too long (max 2000 characters)' }
  }
  return { valid: true }
}
