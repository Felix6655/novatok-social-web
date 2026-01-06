'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Video, VideoOff, Mic, MicOff, Monitor, Phone, Copy, Users,
  Send, ArrowLeft, MoreVertical, MessageCircle, X, User
} from 'lucide-react'
import {
  addRecentRoom,
  getRoomInfo,
  getRoomMessages,
  addRoomMessage,
  formatMessageTime
} from '@/lib/rooms/storage'
import { useToast } from '@/components/ui/ToastProvider'

// Placeholder participant data
const PLACEHOLDER_PARTICIPANTS = [
  { id: 'you', name: 'You', isLocal: true },
]

export default function RoomPage({ params }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const roomId = params.id
  const queryName = searchParams.get('name')
  
  const [mounted, setMounted] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [participants, setParticipants] = useState(PLACEHOLDER_PARTICIPANTS)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  
  const messagesEndRef = useRef(null)

  // Initialize room
  useEffect(() => {
    setMounted(true)
    
    // Get room name from query or history
    const existingRoom = getRoomInfo(roomId)
    const name = queryName || existingRoom?.name || `Room ${roomId.slice(0, 4).toUpperCase()}`
    setRoomName(name)
    
    // Add to recent rooms
    addRecentRoom(roomId, name)
    
    // Load existing messages
    const existingMessages = getRoomMessages(roomId)
    if (existingMessages.length > 0) {
      setMessages(existingMessages)
    } else {
      // Add system message for joining
      const joinMsg = addRoomMessage(roomId, {
        type: 'system',
        text: 'You joined the room'
      })
      setMessages([joinMsg])
    }
  }, [roomId, queryName])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleCopyInvite = () => {
    const url = `${window.location.origin}/rooms/${roomId}`
    navigator.clipboard.writeText(url)
    toast({ type: 'success', message: 'Invite link copied!' })
  }

  const handleLeaveRoom = () => {
    // Add leave message
    addRoomMessage(roomId, {
      type: 'system',
      text: 'You left the room'
    })
    router.push('/rooms')
  }

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
    toast({ type: 'info', message: 'Microphone control coming soon' })
    setIsMicOn(!isMicOn)
  }

  const handleToggleCamera = () => {
    toast({ type: 'info', message: 'Camera control coming soon' })
    setIsCameraOn(!isCameraOn)
  }

  const handleToggleScreenShare = () => {
    toast({ type: 'info', message: 'Screen sharing coming soon' })
    setIsScreenSharing(!isScreenSharing)
  }

  // Calculate grid layout based on participant count
  const getGridClass = () => {
    const count = participants.length
    if (count <= 1) return 'grid-cols-1'
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-3'
  }

  if (!mounted) {
    return (
      <div className="h-[calc(100vh-80px)] md:h-screen flex items-center justify-center bg-black">
        <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-80px)] md:h-screen flex flex-col bg-black -m-4 md:-m-6 overflow-hidden">
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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Video className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h1 className="font-semibold text-white text-sm">{roomName}</h1>
              <p className="text-xs text-gray-500 font-mono">{roomId}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyInvite}
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
            onClick={handleLeaveRoom}
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
          <div className={`grid ${getGridClass()} gap-4 h-full`}>
            {/* Local "You" Tile */}
            <div className="relative rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 overflow-hidden aspect-video flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-3 border border-indigo-500/30">
                  <User className="w-8 h-8 text-indigo-400" />
                </div>
                <p className="text-white font-medium">You</p>
                <p className="text-gray-500 text-sm mt-1">
                  {isCameraOn ? 'Camera on' : 'Camera will appear here'}
                </p>
              </div>
              
              {/* Name badge */}
              <div className="absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-black/60 text-white text-sm font-medium">
                You {isMicOn ? '' : '🔇'}
              </div>
            </div>

            {/* Waiting for participants tiles */}
            {[1, 2, 3, 4, 5, 6, 7, 8].slice(0, participants.length > 1 ? 8 - participants.length : 3).map((_, i) => (
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
          {/* Chat Header */}
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

          {/* Messages */}
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

          {/* Message Input */}
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
          title={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
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
          title={isCameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {isCameraOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        <button
          onClick={handleToggleScreenShare}
          className={`p-4 rounded-full transition-all ${
            isScreenSharing
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          <Monitor className="w-6 h-6" />
        </button>

        <button
          onClick={handleLeaveRoom}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          title="Leave room"
        >
          <Phone className="w-6 h-6 rotate-[135deg]" />
        </button>
      </div>
    </div>
  )
}
