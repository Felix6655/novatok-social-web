'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { 
  Bot, Sparkles, Zap, Send, Loader2, Plus, Trash2,
  User, AlertCircle, RefreshCw, Palette, Target, BookOpen
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import { useTranslation } from 'react-i18next'
import {
  checkChatStatus,
  sendChatMessage,
  loadConversation,
  saveConversation,
  clearConversation,
  validateMessageInput,
} from '@/src/services/aiChat'

// Persona definitions with icons
const PERSONAS = [
  { id: 'creative', icon: Palette, color: 'pink' },
  { id: 'coach', icon: Target, color: 'green' },
  { id: 'expert', icon: BookOpen, color: 'amber' },
]

const colorClasses = {
  pink: { 
    bg: 'bg-pink-500/20', 
    border: 'border-pink-500/30', 
    text: 'text-pink-400', 
    gradient: 'from-pink-500/20 to-rose-500/20',
    button: 'from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500',
  },
  green: { 
    bg: 'bg-green-500/20', 
    border: 'border-green-500/30', 
    text: 'text-green-400', 
    gradient: 'from-green-500/20 to-emerald-500/20',
    button: 'from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500',
  },
  amber: { 
    bg: 'bg-amber-500/20', 
    border: 'border-amber-500/30', 
    text: 'text-amber-400', 
    gradient: 'from-amber-500/20 to-orange-500/20',
    button: 'from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500',
  },
}

// Message Bubble Component
function MessageBubble({ message, persona, colors, t }) {
  const isUser = message.role === 'user'
  const Icon = PERSONAS.find(p => p.id === persona)?.icon || Bot
  
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
        <p className="text-gray-200 text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
function EmptyChatState({ persona, colors, t }) {
  const Icon = PERSONAS.find(p => p.id === persona)?.icon || Bot
  const personaName = t(`aiChat.personas.${persona}.name`)
  const personaFullDesc = t(`aiChat.personas.${persona}.fullDesc`)
  
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center mx-auto mb-4 border ${colors.border}`}>
          <Icon className={`w-10 h-10 ${colors.text}`} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{personaName}</h3>
        <p className="text-gray-400 text-sm mb-4">{personaFullDesc}</p>
        <p className="text-gray-500 text-xs">{t('aiChat.emptyChatDesc')}</p>
      </div>
    </div>
  )
}

// Not Configured State
function NotConfiguredState({ t }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
          <AlertCircle className="w-8 h-8 text-amber-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{t('aiChat.notConfigured')}</h3>
        <p className="text-gray-400 text-sm">
          {t('aiChat.notConfiguredDesc')}
        </p>
      </div>
    </div>
  )
}

// Error State
function ErrorState({ error, onRetry, t }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-400 text-sm font-medium">{t('aiChat.errorOccurred')}</p>
        <p className="text-red-400/70 text-xs">{error}</p>
      </div>
      <button
        onClick={onRetry}
        className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center gap-1"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        {t('aiChat.errorRetry')}
      </button>
    </div>
  )
}

// Typing Indicator
function TypingIndicator({ colors }) {
  return (
    <div className="flex gap-3">
      <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${colors.bg} ${colors.border} border`}>
        <Loader2 className={`w-4 h-4 ${colors.text} animate-spin`} />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-gray-800/80 border border-gray-700/50">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  )
}

export default function AIChatPage() {
  const { toast } = useToast()
  const { t, i18n } = useTranslation()
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  // State
  const [mounted, setMounted] = useState(false)
  const [isConfigured, setIsConfigured] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPersona, setSelectedPersona] = useState(null)
  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState(null)
  const [charCount, setCharCount] = useState(0)
  
  // Get current colors
  const currentColors = selectedPersona 
    ? colorClasses[PERSONAS.find(p => p.id === selectedPersona)?.color || 'pink']
    : colorClasses.pink

  // Initialize
  useEffect(() => {
    setMounted(true)
    
    async function init() {
      try {
        const status = await checkChatStatus()
        setIsConfigured(status.configured)
      } catch (err) {
        console.error('Init error:', err)
        setIsConfigured(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    init()
  }, [])

  // Load conversation when persona changes
  useEffect(() => {
    if (!selectedPersona) return
    
    async function loadChat() {
      const data = await loadConversation(selectedPersona)
      if (data && data.messages.length > 0) {
        setMessages(data.messages)
      } else {
        setMessages([])
      }
      setError(null)
      inputRef.current?.focus()
    }
    
    loadChat()
  }, [selectedPersona])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending])

  // Update char count
  useEffect(() => {
    setCharCount(inputValue.length)
  }, [inputValue])

  // Select persona and start chat
  const handleSelectPersona = (personaId) => {
    setSelectedPersona(personaId)
  }

  // Clear current chat
  const handleClearChat = async () => {
    if (!selectedPersona) return
    
    await clearConversation(selectedPersona)
    setMessages([])
    setError(null)
    toast({ type: 'success', message: t('aiChat.clearChat') })
  }

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!selectedPersona || isSending) return
    
    // Validate input
    const validation = validateMessageInput(inputValue)
    if (!validation.valid) {
      toast({ type: 'error', message: validation.error })
      return
    }
    
    const userContent = inputValue.trim()
    setInputValue('')
    setCharCount(0)
    setError(null)
    setIsSending(true)
    
    // Add user message immediately
    const userMessage = {
      role: 'user',
      content: userContent,
      timestamp: new Date().toISOString(),
    }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    
    try {
      // Send to API
      const response = await sendChatMessage({
        persona: selectedPersona,
        messages: updatedMessages,
        language: i18n.language,
      })
      
      if (!response.ok) {
        setError(response.error?.message || t('aiChat.errorOccurred'))
        // Save conversation even with error
        await saveConversation(selectedPersona, updatedMessages)
        return
      }
      
      // Add assistant message
      const assistantMessage = {
        ...response.message,
        timestamp: new Date().toISOString(),
      }
      const finalMessages = [...updatedMessages, assistantMessage]
      setMessages(finalMessages)
      
      // Save to storage
      await saveConversation(selectedPersona, finalMessages)
      
    } catch (err) {
      console.error('Send error:', err)
      setError(err.message || t('aiChat.errorOccurred'))
      // Save conversation even with error
      await saveConversation(selectedPersona, updatedMessages)
    } finally {
      setIsSending(false)
    }
  }, [selectedPersona, inputValue, messages, isSending, i18n.language, toast, t])

  // Retry last message
  const handleRetry = useCallback(async () => {
    if (!selectedPersona || messages.length === 0) return
    
    // Remove last assistant message if exists and retry
    const lastMsg = messages[messages.length - 1]
    let messagesToRetry = messages
    
    if (lastMsg.role === 'assistant') {
      messagesToRetry = messages.slice(0, -1)
      setMessages(messagesToRetry)
    }
    
    setError(null)
    setIsSending(true)
    
    try {
      const response = await sendChatMessage({
        persona: selectedPersona,
        messages: messagesToRetry,
        language: i18n.language,
      })
      
      if (!response.ok) {
        setError(response.error?.message || t('aiChat.errorOccurred'))
        return
      }
      
      const assistantMessage = {
        ...response.message,
        timestamp: new Date().toISOString(),
      }
      const finalMessages = [...messagesToRetry, assistantMessage]
      setMessages(finalMessages)
      await saveConversation(selectedPersona, finalMessages)
      
    } catch (err) {
      setError(err.message || t('aiChat.errorOccurred'))
    } finally {
      setIsSending(false)
    }
  }, [selectedPersona, messages, i18n.language, t])

  // Handle Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Loading state
  if (!mounted || isLoading) {
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
            <h1 className="text-lg font-semibold text-white">{t('aiChat.title')}</h1>
            <p className="text-sm text-gray-500">
              {selectedPersona 
                ? t('aiChat.chattingWith', { name: t(`aiChat.personas.${selectedPersona}.name`) })
                : t('aiChat.subtitle')
              }
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedPersona && (
            <>
              <button
                onClick={handleClearChat}
                className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                title={t('aiChat.clearChat')}
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => setSelectedPersona(null)}
                className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                title={t('aiChat.newChat')}
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 flex flex-col overflow-hidden">
        {isConfigured === false ? (
          <NotConfiguredState t={t} />
        ) : !selectedPersona ? (
          // Persona Selection
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <h2 className="text-xl font-bold text-white mb-2">{t('aiChat.selectPersona')}</h2>
            <p className="text-gray-400 text-sm mb-6">{t('aiChat.selectPersonaDesc')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              {PERSONAS.map(persona => {
                const colors = colorClasses[persona.color]
                const Icon = persona.icon
                return (
                  <button
                    key={persona.id}
                    onClick={() => handleSelectPersona(persona.id)}
                    className={`p-5 rounded-xl bg-gradient-to-br ${colors.gradient} border ${colors.border} hover:scale-[1.02] transition-transform text-left`}
                  >
                    <Icon className={`w-8 h-8 ${colors.text} mb-3`} />
                    <h3 className="font-semibold text-white text-lg">
                      {t(`aiChat.personas.${persona.id}.name`)}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      {t(`aiChat.personas.${persona.id}.desc`)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {t(`aiChat.personas.${persona.id}.fullDesc`)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && !isSending ? (
                <EmptyChatState 
                  persona={selectedPersona} 
                  colors={currentColors}
                  t={t}
                />
              ) : (
                <>
                  {messages.map((msg, idx) => (
                    <MessageBubble 
                      key={idx} 
                      message={msg} 
                      persona={selectedPersona}
                      colors={currentColors}
                      t={t}
                    />
                  ))}
                  
                  {/* Typing indicator */}
                  {isSending && <TypingIndicator colors={currentColors} />}
                  
                  {/* Error state */}
                  {error && !isSending && (
                    <ErrorState error={error} onRetry={handleRetry} t={t} />
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={t('aiChat.messagePlaceholder')}
                    disabled={isSending || !isConfigured}
                    maxLength={2000}
                    className="w-full px-4 py-3 pr-16 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 disabled:opacity-50"
                  />
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${
                    charCount > 1800 ? 'text-amber-400' : charCount > 1950 ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {charCount}/2000
                  </span>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isSending || !isConfigured}
                  className={`px-4 py-3 rounded-xl bg-gradient-to-r ${currentColors.button} text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
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
