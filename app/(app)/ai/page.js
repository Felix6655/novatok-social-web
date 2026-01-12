'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Bot, MessageSquare, Sparkles, Zap, Send, Loader2, Plus, Trash2,
  ChevronLeft, User, AlertCircle, History, X, RefreshCw
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import {
  checkChatStatus,
  sendMessage,
  createConversation,
  getConversations,
  getConversation,
  addMessageToConversation,
  deleteConversation,
  formatConversationDate,
  getConversationPreview,
} from '@/src/services/aiChat'

// AI Personalities
const PERSONALITIES = [
  { id: 'assistant', name: 'Nova', icon: Bot, color: 'cyan', desc: 'Helpful Assistant' },
  { id: 'creative', name: 'Muse', icon: Sparkles, color: 'pink', desc: 'Creative Partner' },
  { id: 'coach', name: 'Sage', icon: User, color: 'green', desc: 'Life Coach' },
  { id: 'expert', name: 'Atlas', icon: Zap, color: 'amber', desc: 'Knowledge Expert' },
]

const colorClasses = {
  cyan: { bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', gradient: 'from-cyan-500/20 to-blue-500/20' },
  pink: { bg: 'bg-pink-500/20', border: 'border-pink-500/30', text: 'text-pink-400', gradient: 'from-pink-500/20 to-rose-500/20' },
  green: { bg: 'bg-green-500/20', border: 'border-green-500/30', text: 'text-green-400', gradient: 'from-green-500/20 to-emerald-500/20' },
  amber: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400', gradient: 'from-amber-500/20 to-orange-500/20' },
}

// Message Bubble Component
function MessageBubble({ message, personality }) {
  const isUser = message.role === 'user'
  const colors = colorClasses[personality?.color || 'cyan']
  const Icon = personality?.icon || Bot
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
        isUser ? 'bg-purple-500/20 border border-purple-500/30' : `${colors.bg} ${colors.border} border`
      }`}>
        {isUser ? (
          <User className="w-4 h-4 text-purple-400" />
        ) : (
          <Icon className={`w-4 h-4 ${colors.text}`} />
        )}
      </div>
      <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${
        isUser 
          ? 'bg-purple-500/20 border border-purple-500/30 rounded-tr-md' 
          : 'bg-gray-800/80 border border-gray-700/50 rounded-tl-md'
      }`}>
        <p className="text-gray-200 text-sm whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <p className="text-xs text-gray-500 mt-1">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}

// Empty Chat State
function EmptyChatState({ personality, onStartChat }) {
  const colors = colorClasses[personality?.color || 'cyan']
  const Icon = personality?.icon || Bot
  
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center mx-auto mb-4 border ${colors.border}`}>
          <Icon className={`w-10 h-10 ${colors.text}`} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Chat with {personality?.name || 'AI'}</h3>
        <p className="text-gray-400 text-sm mb-6">
          {personality?.desc || 'Start a conversation'}
        </p>
        <p className="text-gray-500 text-xs">
          Type a message below to start chatting
        </p>
      </div>
    </div>
  )
}

// Service Not Configured State
function NotConfiguredState() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">AI Service Not Configured</h3>
        <p className="text-gray-400 text-sm">
          Set <code className="px-1.5 py-0.5 bg-gray-800 rounded text-amber-400">EMERGENT_API_KEY</code> or <code className="px-1.5 py-0.5 bg-gray-800 rounded text-amber-400">OPENAI_API_KEY</code> to enable AI chat.
        </p>
      </div>
    </div>
  )
}

export default function AIPage() {
  const { toast } = useToast()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  const [mounted, setMounted] = useState(false)
  const [isConfigured, setIsConfigured] = useState(null)
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [selectedPersonality, setSelectedPersonality] = useState(PERSONALITIES[0])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  
  // Check service status and load conversations
  useEffect(() => {
    setMounted(true)
    
    async function init() {
      setIsLoading(true)
      try {
        const [status, convs] = await Promise.all([
          checkChatStatus(),
          getConversations(),
        ])
        setIsConfigured(status.configured)
        setConversations(convs)
      } catch (error) {
        console.error('Failed to initialize:', error)
        setIsConfigured(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    init()
  }, [])
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])
  
  // Start new conversation
  const handleNewConversation = useCallback(async (personality = selectedPersonality) => {
    try {
      const conv = await createConversation(personality.id, personality.name)
      setCurrentConversation(conv)
      setSelectedPersonality(personality)
      setConversations(prev => [conv, ...prev])
      setShowHistory(false)
      inputRef.current?.focus()
    } catch (error) {
      toast({ type: 'error', message: 'Failed to create conversation' })
    }
  }, [selectedPersonality, toast])
  
  // Load existing conversation
  const handleLoadConversation = useCallback(async (conv) => {
    const personality = PERSONALITIES.find(p => p.id === conv.personality) || PERSONALITIES[0]
    setCurrentConversation(conv)
    setSelectedPersonality(personality)
    setShowHistory(false)
  }, [])
  
  // Delete conversation
  const handleDeleteConversation = useCallback(async (id, e) => {
    e.stopPropagation()
    try {
      await deleteConversation(id)
      setConversations(prev => prev.filter(c => c.id !== id))
      if (currentConversation?.id === id) {
        setCurrentConversation(null)
      }
      toast({ type: 'success', message: 'Conversation deleted' })
    } catch (error) {
      toast({ type: 'error', message: 'Failed to delete' })
    }
  }, [currentConversation, toast])
  
  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return
    
    const userMessage = inputValue.trim()
    setInputValue('')
    setIsSending(true)
    
    try {
      // Create conversation if needed
      let conv = currentConversation
      if (!conv) {
        conv = await createConversation(selectedPersonality.id, selectedPersonality.name)
        setConversations(prev => [conv, ...prev])
      }
      
      // Add user message locally first
      const userMsg = { role: 'user', content: userMessage }
      conv = await addMessageToConversation(conv.id, userMsg)
      setCurrentConversation({ ...conv })
      
      // Send to API
      const response = await sendMessage({
        messages: conv.messages.map(m => ({ role: m.role, content: m.content })),
        personality: selectedPersonality.id,
      })
      
      // Add AI response
      const aiMsg = { role: 'assistant', content: response.message }
      conv = await addMessageToConversation(conv.id, aiMsg)
      setCurrentConversation({ ...conv })
      
      // Update conversations list
      setConversations(prev => {
        const filtered = prev.filter(c => c.id !== conv.id)
        return [conv, ...filtered]
      })
      
    } catch (error) {
      console.error('Send message error:', error)
      toast({ type: 'error', message: error.message || 'Failed to send message' })
    } finally {
      setIsSending(false)
    }
  }, [inputValue, isSending, currentConversation, selectedPersonality, toast])
  
  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gray-800/50 rounded-xl w-48" />
        <div className="h-96 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }
  
  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
            <Bot className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Chat with AIs</h1>
            <p className="text-sm text-gray-500">
              {currentConversation ? `Chatting with ${selectedPersonality.name}` : 'AI-powered conversations'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors relative"
            title="History"
          >
            <History className="w-5 h-5 text-gray-400" />
            {conversations.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-bold text-white flex items-center justify-center">
                {conversations.length}
              </span>
            )}
          </button>
          <button
            onClick={() => handleNewConversation()}
            className="p-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 transition-colors"
            title="New Chat"
          >
            <Plus className="w-5 h-5 text-cyan-400" />
          </button>
        </div>
      </div>
      
      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 md:relative md:inset-auto">
          <div className="absolute inset-0 bg-black/60 md:hidden" onClick={() => setShowHistory(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-[hsl(0,0%,7%)] border-l border-gray-800 p-4 overflow-y-auto md:relative md:w-full md:border md:rounded-2xl md:mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Conversations</h3>
              <button onClick={() => setShowHistory(false)} className="md:hidden p-1 text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No conversations yet</p>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => {
                  const personality = PERSONALITIES.find(p => p.id === conv.personality) || PERSONALITIES[0]
                  const colors = colorClasses[personality.color]
                  const Icon = personality.icon
                  
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleLoadConversation(conv)}
                      className={`w-full p-3 rounded-xl text-left transition-colors group ${
                        currentConversation?.id === conv.id 
                          ? `${colors.bg} ${colors.border} border` 
                          : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${colors.bg} ${colors.border} border`}>
                          <Icon className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className={`text-sm font-medium ${colors.text}`}>{personality.name}</span>
                            <span className="text-xs text-gray-500">{formatConversationDate(conv.updatedAt)}</span>
                          </div>
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {getConversationPreview(conv)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Main Chat Area */}
      <div className="flex-1 bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : isConfigured === false ? (
          <NotConfiguredState />
        ) : !currentConversation ? (
          // Personality Selection
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-bold text-white mb-2">Choose an AI to chat with</h2>
            <p className="text-gray-400 text-sm mb-6">Select a personality to start a conversation</p>
            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
              {PERSONALITIES.map(p => {
                const colors = colorClasses[p.color]
                const Icon = p.icon
                return (
                  <button
                    key={p.id}
                    onClick={() => handleNewConversation(p)}
                    className={`p-4 rounded-xl bg-gradient-to-br ${colors.gradient} border ${colors.border} hover:scale-[1.02] transition-transform text-left`}
                  >
                    <Icon className={`w-8 h-8 ${colors.text} mb-2`} />
                    <h3 className="font-semibold text-white">{p.name}</h3>
                    <p className="text-xs text-gray-400">{p.desc}</p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages.length === 0 ? (
                <EmptyChatState personality={selectedPersonality} />
              ) : (
                <>
                  {currentConversation.messages.map((msg, idx) => (
                    <MessageBubble 
                      key={msg.id || idx} 
                      message={msg} 
                      personality={selectedPersonality}
                    />
                  ))}
                  {isSending && (
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${colorClasses[selectedPersonality.color].bg} ${colorClasses[selectedPersonality.color].border} border`}>
                        <Loader2 className={`w-4 h-4 ${colorClasses[selectedPersonality.color].text} animate-spin`} />
                      </div>
                      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-gray-800/80 border border-gray-700/50">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Input Area */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message ${selectedPersonality.name}...`}
                  disabled={isSending || !isConfigured}
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSending || !isConfigured}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
