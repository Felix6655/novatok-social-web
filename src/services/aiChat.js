/**
 * AI Chat Service Layer
 * 
 * Handles chat communication and conversation persistence.
 */

import storage from './storage'
import { ApiError, ErrorCodes } from './api'

const AI_CHAT_API = '/api/ai/chat'
const CONVERSATIONS_KEY = 'novatok_ai_conversations'
const MAX_CONVERSATIONS = 20
const MAX_MESSAGES_PER_CONVERSATION = 50

// ==========================================
// API Functions
// ==========================================

/**
 * Check AI chat service status
 */
export async function checkChatStatus() {
  const response = await fetch(AI_CHAT_API)
  
  if (!response.ok) {
    throw new ApiError('Failed to check AI status', response.status, ErrorCodes.SERVER_ERROR)
  }
  
  return response.json()
}

/**
 * Send a message and get AI response
 * @param {Object} params
 * @param {Array} params.messages - Conversation history
 * @param {string} params.personality - AI personality ID
 */
export async function sendMessage({ messages, personality }) {
  const response = await fetch(AI_CHAT_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, personality }),
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    throw new ApiError(
      data.error || 'Failed to send message',
      response.status,
      data.code || ErrorCodes.SERVER_ERROR
    )
  }
  
  return data
}

// ==========================================
// Conversation Storage
// ==========================================

/**
 * Create a new conversation
 * @param {string} personality - AI personality ID
 * @param {string} personalityName - AI display name
 */
export async function createConversation(personality, personalityName) {
  const conversations = await getConversations()
  
  const newConversation = {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    personality,
    personalityName,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  
  const updated = [newConversation, ...conversations].slice(0, MAX_CONVERSATIONS)
  await storage.setItem(CONVERSATIONS_KEY, updated)
  
  return newConversation
}

/**
 * Get all conversations
 */
export async function getConversations() {
  const stored = await storage.getItem(CONVERSATIONS_KEY, [])
  return Array.isArray(stored) ? stored : []
}

/**
 * Get a specific conversation by ID
 */
export async function getConversation(id) {
  const conversations = await getConversations()
  return conversations.find(c => c.id === id) || null
}

/**
 * Add a message to a conversation
 * @param {string} conversationId
 * @param {Object} message - { role: 'user'|'assistant', content: string }
 */
export async function addMessageToConversation(conversationId, message) {
  const conversations = await getConversations()
  const index = conversations.findIndex(c => c.id === conversationId)
  
  if (index === -1) {
    throw new Error('Conversation not found')
  }
  
  const conversation = conversations[index]
  conversation.messages = [
    ...conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION + 1),
    {
      ...message,
      id: `msg_${Date.now()}`,
      timestamp: new Date().toISOString(),
    },
  ]
  conversation.updatedAt = new Date().toISOString()
  
  // Move to top of list
  conversations.splice(index, 1)
  conversations.unshift(conversation)
  
  await storage.setItem(CONVERSATIONS_KEY, conversations)
  
  return conversation
}

/**
 * Delete a conversation
 */
export async function deleteConversation(id) {
  const conversations = await getConversations()
  const filtered = conversations.filter(c => c.id !== id)
  await storage.setItem(CONVERSATIONS_KEY, filtered)
}

/**
 * Clear all conversations
 */
export async function clearAllConversations() {
  await storage.setItem(CONVERSATIONS_KEY, [])
}

// ==========================================
// Utility Functions
// ==========================================

/**
 * Format conversation date for display
 */
export function formatConversationDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
  
  return date.toLocaleDateString()
}

/**
 * Get conversation preview (first user message)
 */
export function getConversationPreview(conversation) {
  const firstUserMessage = conversation.messages.find(m => m.role === 'user')
  if (!firstUserMessage) return 'New conversation'
  return firstUserMessage.content.slice(0, 60) + (firstUserMessage.content.length > 60 ? '...' : '')
}
