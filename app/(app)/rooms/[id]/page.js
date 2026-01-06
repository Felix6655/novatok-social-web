'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { 
  Video, VideoOff, Mic, MicOff, Monitor, Phone, Copy, Users,
  Send, ArrowLeft, MessageCircle, X, User, AlertCircle, Loader2, Info
} from 'lucide-react'
import {
  addRecentRoom,
  getRoomInfo,
  getRoomMessages,
  addRoomMessage,
  formatMessageTime,
  getDisplayName,
  setDisplayName,
  getUserIdentity
} from '@/lib/rooms/storage'
import { useToast } from '@/components/ui/ToastProvider'

// Dynamically import LiveRoom to avoid SSR issues with LiveKit
const LiveRoom = dynamic(() => import('@/components/rooms/LiveRoom'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-black">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading video room...</p>
      </div>
    </div>
  )
})

// Demo Mode Banner
function DemoModeBanner() {
  return (
    <div className="absolute top-16 left-4 md:left-auto md:right-4 z-30 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-medium">
      <Info className="w-3 h-3" />
      <span>LiveKit not configured — Rooms are in demo mode</span>
    </div>
  )
}

// Name Input Modal
function NameModal({ isOpen, onSubmit, initialName = '' }) {
  const [name, setName] = useState(initialName)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) {
      onSubmit(trimmed)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
            <User className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Enter your name</h2>
            <p className="text-sm text-gray-400">This will be shown to other participants</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            maxLength={30}
            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all mb-4"
          />

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Video className="w-5 h-5" />
            Join Room
          </button>
        </form>
      </div>
    </div>
  )
}

// Demo Mode Room (Phase 0 UI)
function DemoRoom({ roomId, roomName, onLeave, onCopyInvite }) {
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const messagesEndRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    // Load existing messages or add join message
    const existingMessages = getRoomMessages(roomId)
    if (existingMessages.length > 0) {
      setMessages(existingMessages)
    } else {
      const joinMsg = addRoomMessage(roomId, {
        type: 'system',
        text: 'You joined the room (demo mode)'
      })
      setMessages([joinMsg])
    }
  }, [roomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    const text = messageInput.trim()
    if (!text) return
    
    const newMsg = addRoomMessage(roomId, {
      type: 'user',
      text,
      sender: 'You'
    })
    
    setMessages(prev => [...prev, newMsg])
    setMessageInput('')
  }

  const handleToggleMic = () => {
    toast({ type: 'info', message: 'Mic toggle requires LiveKit configuration' })
    setIsMicOn(!isMicOn)
  }

  const handleToggleCamera = () => {
    toast({ type: 'info', message: 'Camera toggle requires LiveKit configuration' })
    setIsCameraOn(!isCameraOn)
  }

  const handleScreenShare = () => {
    toast({ type: 'info', message: 'Screen sharing requires LiveKit configuration' })
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[hsl(0,0%,9%)] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Link
            href="/rooms"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30">
              <Video className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-sm">{roomName}</h1>
              <p className="text-xs text-gray-500 font-mono">{roomId}</p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium border border-amber-500/30">
              Demo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onCopyInvite}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-colors text-sm"
          >
            <Copy className="w-4 h-4" />
            <span className="hidden sm:inline">Copy Invite</span>
          </button>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`p-2 rounded-lg transition-colors md:hidden ${
              isChatOpen 
                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <MessageCircle className="w-5 h-5" />
          </button>

          <button
            onClick={onLeave}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-sm"
          >
            <Phone className="w-4 h-4 rotate-[135deg]" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid Area */}
        <div className={`flex-1 p-4 overflow-auto transition-all ${isChatOpen ? 'md:mr-80' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
            {/* Local "You" Tile */}
            <div className="relative rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-3 border border-indigo-500/30">
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-white font-medium">You</p>
                <p className="text-gray-500 text-sm mt-1">
                  {isCameraOn ? 'Camera on (demo)' : 'Camera will appear here'}
                </p>
              </div>
              
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 text-white text-sm font-medium">
                You {isMicOn ? '' : '🔇'}
              </div>
            </div>

            {/* Waiting tiles */}
            {[1, 2, 3].map((_, i) => (
              <div 
                key={i}
                className="relative rounded-2xl bg-gray-900/50 border border-gray-800 border-dashed overflow-hidden aspect-video flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-2">
                    <Users className="w-6 h-6 text-gray-600" />
                  </div>
                  <p className="text-gray-600 text-sm">Waiting for participants...</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`fixed md:absolute right-0 top-0 bottom-0 w-full md:w-80 bg-[hsl(0,0%,9%)] border-l border-gray-800 flex flex-col transition-transform z-20 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-white">Chat</span>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id}>
                {msg.type === 'system' ? (
                  <div className="text-center">
                    <span className="text-xs text-gray-500 bg-gray-800/50 px-3 py-1 rounded-full">
                      {msg.text}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-sm font-medium text-indigo-400">{msg.sender}</span>
                      <span className="text-xs text-gray-600">{formatMessageTime(msg.timestamp)}</span>
                    </div>
                    <div className="bg-gray-800/50 rounded-xl rounded-tl-none px-3 py-2 text-sm text-white">
                      {msg.text}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-800">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
                className="p-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-center gap-4 px-4 py-4 bg-[hsl(0,0%,9%)] border-t border-gray-800">
        <button
          onClick={handleToggleMic}
          className={`p-4 rounded-full transition-all ${
            isMicOn
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
          }`}
        >
          {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        <button
          onClick={handleToggleCamera}
          className={`p-4 rounded-full transition-all ${
            isCameraOn
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
          }`}
        >
          {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={handleScreenShare}
          className="p-4 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-all"
        >
          <Monitor className="w-6 h-6" />
        </button>

        <button
          onClick={onLeave}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        >
          <Phone className="w-6 h-6 rotate-[135deg]" />
        </button>
      </div>
    </div>
  )
}

// Main Room Page Component
export default function RoomPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const roomId = params.id
  const queryName = searchParams.get('name')
  
  const [mounted, setMounted] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [isLiveKitConfigured, setIsLiveKitConfigured] = useState(false)
  const [isCheckingConfig, setIsCheckingConfig] = useState(true)
  const [showNameModal, setShowNameModal] = useState(false)
  const [displayName, setDisplayNameState] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [liveKitToken, setLiveKitToken] = useState(null)
  const [liveKitUrl, setLiveKitUrl] = useState(null)
  const [connectionError, setConnectionError] = useState(null)

  // Initialize
  useEffect(() => {
    setMounted(true)
    
    // Get room name
    const existingRoom = getRoomInfo(roomId)
    const name = queryName || existingRoom?.name || `Room ${roomId.slice(0, 4).toUpperCase()}`
    setRoomName(name)
    
    // Add to recent rooms
    addRecentRoom(roomId, name)
    
    // Get saved display name
    const savedName = getDisplayName()
    if (savedName) {
      setDisplayNameState(savedName)
    }
  }, [roomId, queryName])

  // Check LiveKit configuration
  useEffect(() => {
    if (!mounted) return

    async function checkLiveKit() {
      try {
        const res = await fetch('/api/livekit/token')
        const data = await res.json()
        setIsLiveKitConfigured(data.configured)
        if (data.url) {
          setLiveKitUrl(data.url)
        }
      } catch (e) {
        console.error('Failed to check LiveKit config:', e)
        setIsLiveKitConfigured(false)
      } finally {
        setIsCheckingConfig(false)
      }
    }

    checkLiveKit()
  }, [mounted])

  // Auto-show name modal if LiveKit is configured and no name saved
  useEffect(() => {
    if (!isCheckingConfig && isLiveKitConfigured && !displayName) {
      setShowNameModal(true)
    }
  }, [isCheckingConfig, isLiveKitConfigured, displayName])

  // Auto-connect if LiveKit is configured and we have a name
  useEffect(() => {
    if (!isCheckingConfig && isLiveKitConfigured && displayName && !liveKitToken && !isConnecting) {
      connectToRoom()
    }
  }, [isCheckingConfig, isLiveKitConfigured, displayName, liveKitToken, isConnecting])

  const connectToRoom = async () => {
    if (!displayName) {
      setShowNameModal(true)
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      const identity = getUserIdentity()
      
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room: roomId,
          identity,
          name: displayName
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to get token')
      }

      const data = await res.json()
      setLiveKitToken(data.token)
      setLiveKitUrl(data.url)
    } catch (e) {
      console.error('Connection error:', e)
      setConnectionError(e.message)
      toast({ type: 'error', message: e.message })
    } finally {
      setIsConnecting(false)
    }
  }

  const handleNameSubmit = (name) => {
    setDisplayName(name)
    setDisplayNameState(name)
    setShowNameModal(false)
  }

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/rooms/${roomId}?name=${encodeURIComponent(roomName)}`
    navigator.clipboard.writeText(url)
    toast({ type: 'success', message: 'Invite link copied!' })
  }

  const handleLeave = () => {
    addRoomMessage(roomId, {
      type: 'system',
      text: 'You left the room'
    })
    router.push('/rooms')
  }

  // Loading state
  if (!mounted || isCheckingConfig) {
    return (
      <div className="h-[calc(100vh-80px)] md:h-screen flex items-center justify-center bg-black -m-4 md:-m-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Checking room configuration...</p>
        </div>
      </div>
    )
  }

  // Connection error state
  if (connectionError && isLiveKitConfigured) {
    return (
      <div className="h-[calc(100vh-80px)] md:h-screen flex flex-col bg-black -m-4 md:-m-6">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connection Failed</h2>
            <p className="text-gray-400 mb-4">{connectionError}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => {
                  setConnectionError(null)
                  connectToRoom()
                }}
                className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleLeave}
                className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Connecting state
  if (isConnecting) {
    return (
      <div className="h-[calc(100vh-80px)] md:h-screen flex items-center justify-center bg-black -m-4 md:-m-6">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Connecting to room...</p>
          <p className="text-gray-600 text-sm mt-2">Requesting camera & mic permissions</p>
        </div>
      </div>
    )
  }

  // Live room (LiveKit connected)
  if (isLiveKitConfigured && liveKitToken && liveKitUrl) {
    return (
      <div className="h-[calc(100vh-80px)] md:h-screen bg-black -m-4 md:-m-6 overflow-hidden">
        <LiveRoom
          roomId={roomId}
          roomName={roomName}
          token={liveKitToken}
          serverUrl={liveKitUrl}
          onLeave={handleLeave}
          onCopyInvite={handleCopyInvite}
          onToast={toast}
        />
      </div>
    )
  }

  // Demo mode (no LiveKit configured)
  return (
    <div className="h-[calc(100vh-80px)] md:h-screen bg-black relative -m-4 md:-m-6 overflow-hidden">
      {!isLiveKitConfigured && <DemoModeBanner />}
      
      <DemoRoom
        roomId={roomId}
        roomName={roomName}
        onLeave={handleLeave}
        onCopyInvite={handleCopyInvite}
      />

      {/* Name Modal (for LiveKit mode) */}
      <NameModal
        isOpen={showNameModal}
        onSubmit={handleNameSubmit}
        initialName={displayName}
      />
    </div>
  )
}
