'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  LiveKitRoom,
  VideoTrack,
  AudioTrack,
  useTracks,
  useParticipants,
  useLocalParticipant,
  useRoomContext,
  RoomAudioRenderer,
} from '@livekit/components-react'
import { Track, RoomEvent } from 'livekit-client'
import '@livekit/components-styles'
import {
  Video, VideoOff, Mic, MicOff, Monitor, MonitorOff, Phone, Copy, Users,
  Send, MessageCircle, X, User, AlertCircle, Loader2
} from 'lucide-react'
import { formatMessageTime } from '@/lib/rooms/storage'

// Screen Share Tile Component
function ScreenShareTile({ trackRef, participantName, isLarge = false }) {
  return (
    <div className={`relative rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-cyan-500/50 overflow-hidden ${isLarge ? 'col-span-2 row-span-2' : ''}`}>
      <VideoTrack
        trackRef={trackRef}
        className="w-full h-full object-contain bg-black"
      />
      {/* Screen share badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/90 backdrop-blur-sm">
        <Monitor className="w-4 h-4 text-white" />
        <span className="text-white text-sm font-medium">
          Screen • {participantName}
        </span>
      </div>
    </div>
  )
}

// Participant Video Tile Component
function ParticipantTile({ participant, isLocal = false, isSmall = false }) {
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.Microphone],
    { onlySubscribed: false }
  ).filter(t => t.participant.identity === participant.identity)

  const videoTrack = tracks.find(t => t.source === Track.Source.Camera)
  const audioTrack = tracks.find(t => t.source === Track.Source.Microphone)

  const isMuted = !audioTrack?.publication?.isMuted === false
  const isCameraOff = !videoTrack?.publication?.track

  return (
    <div className={`relative rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 overflow-hidden ${isSmall ? 'aspect-video' : 'aspect-video'} flex items-center justify-center`}>
      {videoTrack?.publication?.track ? (
        <VideoTrack
          trackRef={videoTrack}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="text-center">
          <div className={`${isSmall ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-3 border border-indigo-500/30`}>
            <User className={`${isSmall ? 'w-6 h-6' : 'w-8 h-8'} text-indigo-400`} />
          </div>
          <p className={`text-white font-medium ${isSmall ? 'text-sm' : ''}`}>{participant.name || participant.identity}</p>
          <p className={`text-gray-500 ${isSmall ? 'text-xs' : 'text-sm'} mt-1`}>Camera off</p>
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-2 py-1 rounded-lg bg-black/60">
        <span className={`text-white ${isSmall ? 'text-xs' : 'text-sm'} font-medium`}>
          {participant.name || participant.identity}
          {isLocal && ' (You)'}
        </span>
        {isMuted && <MicOff className={`${isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-red-400`} />}
      </div>

      {/* Audio track (hidden, for audio playback) */}
      {audioTrack?.publication?.track && !isLocal && (
        <AudioTrack trackRef={audioTrack} />
      )}
    </div>
  )
}

// Video Grid Component with Screen Share Support
function VideoGrid() {
  const participants = useParticipants()
  const { localParticipant } = useLocalParticipant()
  
  // Get all tracks including screen share
  const allTracks = useTracks(
    [Track.Source.Camera, Track.Source.Microphone, Track.Source.ScreenShare],
    { onlySubscribed: false }
  )
  
  // Find screen share track
  const screenShareTrack = allTracks.find(t => t.source === Track.Source.ScreenShare && t.publication?.track)
  const screenShareParticipant = screenShareTrack?.participant

  // Include local participant in the grid
  const allParticipants = localParticipant
    ? [localParticipant, ...participants.filter(p => p.identity !== localParticipant.identity)]
    : participants

  // Calculate grid layout based on screen share presence
  const getGridClass = () => {
    const count = allParticipants.length
    const hasScreenShare = !!screenShareTrack
    
    if (hasScreenShare) {
      // Screen share layout: screen share takes priority
      if (count <= 2) return 'grid-cols-1 md:grid-cols-2'
      return 'grid-cols-2 md:grid-cols-3'
    }
    
    // Normal layout
    if (count <= 1) return 'grid-cols-1'
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2'
    if (count <= 4) return 'grid-cols-2'
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3'
    return 'grid-cols-3'
  }

  return (
    <div className={`grid ${getGridClass()} gap-4 h-full p-4 auto-rows-fr`}>
      {/* Screen Share Tile (if active) - shown first and larger */}
      {screenShareTrack && (
        <ScreenShareTile
          trackRef={screenShareTrack}
          participantName={screenShareParticipant?.name || screenShareParticipant?.identity || 'Unknown'}
          isLarge={allParticipants.length > 1}
        />
      )}
      
      {/* Participant Tiles */}
      {allParticipants.map((participant) => (
        <ParticipantTile
          key={participant.identity}
          participant={participant}
          isLocal={participant.identity === localParticipant?.identity}
          isSmall={!!screenShareTrack && allParticipants.length > 2}
        />
      ))}
      
      {/* Show placeholder if alone and no screen share */}
      {allParticipants.length === 1 && !screenShareTrack && (
        <div className="relative rounded-2xl bg-gray-900/50 border border-gray-800 border-dashed overflow-hidden aspect-video flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-gray-600 text-sm">Waiting for participants...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Chat Component using Data Channel
function RoomChat({ roomId, isOpen, onClose }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef(null)
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const participants = useParticipants()

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Listen for data messages
  useEffect(() => {
    if (!room) return

    const handleDataReceived = (payload, participant) => {
      try {
        const decoder = new TextDecoder()
        const data = JSON.parse(decoder.decode(payload))
        
        if (data.type === 'chat') {
          setMessages(prev => [...prev, {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            type: 'user',
            text: data.message,
            sender: participant?.name || participant?.identity || 'Unknown',
            timestamp: new Date().toISOString()
          }])
        }
      } catch (e) {
        console.error('Failed to parse data message:', e)
      }
    }

    const handleParticipantConnected = (participant) => {
      setMessages(prev => [...prev, {
        id: `sys_${Date.now()}`,
        type: 'system',
        text: `${participant.name || participant.identity} joined`,
        timestamp: new Date().toISOString()
      }])
    }

    const handleParticipantDisconnected = (participant) => {
      setMessages(prev => [...prev, {
        id: `sys_${Date.now()}`,
        type: 'system',
        text: `${participant.name || participant.identity} left`,
        timestamp: new Date().toISOString()
      }])
    }

    room.on(RoomEvent.DataReceived, handleDataReceived)
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected)
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)

    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived)
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected)
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected)
    }
  }, [room])

  // Add system message when connected
  useEffect(() => {
    if (localParticipant) {
      setMessages([{
        id: 'sys_joined',
        type: 'system',
        text: 'You joined the room',
        timestamp: new Date().toISOString()
      }])
    }
  }, [localParticipant?.identity])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || !room || !localParticipant) return

    try {
      const encoder = new TextEncoder()
      const data = encoder.encode(JSON.stringify({
        type: 'chat',
        message: text
      }))

      await room.localParticipant.publishData(data, { reliable: true })

      // Add to local messages
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        type: 'user',
        text,
        sender: 'You',
        timestamp: new Date().toISOString()
      }])

      setInput('')
    } catch (e) {
      console.error('Failed to send message:', e)
    }
  }

  return (
    <div className={`fixed md:absolute right-0 top-0 bottom-0 w-full md:w-80 bg-[hsl(0,0%,9%)] border-l border-gray-800 flex flex-col transition-transform z-20 ${
      isOpen ? 'translate-x-0' : 'translate-x-full'
    }`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          <span className="font-medium text-white">Chat</span>
          <span className="text-xs text-gray-500">({participants.length + 1} in room)</span>
        </div>
        <button
          onClick={onClose}
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
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim()}
            className="p-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Controls Bar Component with Screen Share
function ControlsBar({ onLeave, isChatOpen, onToggleChat, onScreenShareChange, onToast }) {
  const room = useRoomContext()
  const { localParticipant } = useLocalParticipant()
  const [isMicOn, setIsMicOn] = useState(true)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  // Sync with actual track states
  useEffect(() => {
    if (localParticipant) {
      setIsMicOn(!localParticipant.isMicrophoneEnabled === false)
      setIsCameraOn(!localParticipant.isCameraEnabled === false)
      setIsScreenSharing(localParticipant.isScreenShareEnabled)
    }
  }, [localParticipant?.isMicrophoneEnabled, localParticipant?.isCameraEnabled, localParticipant?.isScreenShareEnabled])

  const toggleMic = async () => {
    try {
      await localParticipant?.setMicrophoneEnabled(!isMicOn)
      setIsMicOn(!isMicOn)
    } catch (e) {
      console.error('Failed to toggle mic:', e)
    }
  }

  const toggleCamera = async () => {
    try {
      await localParticipant?.setCameraEnabled(!isCameraOn)
      setIsCameraOn(!isCameraOn)
    } catch (e) {
      console.error('Failed to toggle camera:', e)
    }
  }

  const handleScreenShare = async () => {
    try {
      if (isScreenSharing) {
        // Stop screen sharing
        await localParticipant?.setScreenShareEnabled(false)
        setIsScreenSharing(false)
        onScreenShareChange?.(false)
        onToast?.({ type: 'info', message: 'Screen sharing stopped' })
      } else {
        // Start screen sharing
        await localParticipant?.setScreenShareEnabled(true)
        setIsScreenSharing(true)
        onScreenShareChange?.(true)
        onToast?.({ type: 'success', message: 'Screen sharing started' })
      }
    } catch (e) {
      console.error('Screen share error:', e)
      
      // Handle specific errors
      if (e.name === 'NotAllowedError' || e.message?.includes('cancelled') || e.message?.includes('denied')) {
        onToast?.({ type: 'info', message: 'Screen share cancelled' })
      } else if (e.name === 'NotSupportedError') {
        onToast?.({ type: 'error', message: 'Screen sharing not supported' })
      } else {
        onToast?.({ type: 'error', message: 'Failed to share screen' })
      }
      
      setIsScreenSharing(false)
    }
  }

  const handleLeave = () => {
    room?.disconnect()
    onLeave()
  }

  return (
    <div className="flex items-center justify-center gap-4 px-4 py-4 bg-[hsl(0,0%,9%)] border-t border-gray-800">
      <button
        onClick={toggleMic}
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
        onClick={toggleCamera}
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
        onClick={handleScreenShare}
        className={`p-4 rounded-full transition-all ${
          isScreenSharing
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
        title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
      >
        {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
      </button>

      <button
        onClick={onToggleChat}
        className={`p-4 rounded-full transition-all hidden md:block ${
          isChatOpen
            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
            : 'bg-gray-700 text-white hover:bg-gray-600'
        }`}
        title="Toggle chat"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      <button
        onClick={handleLeave}
        className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
        title="Leave room"
      >
        <Phone className="w-6 h-6 rotate-[135deg]" />
      </button>
    </div>
  )
}

// Main LiveRoom Component
export default function LiveRoom({
  roomId,
  roomName,
  token,
  serverUrl,
  onLeave,
  onCopyInvite,
  onToast
}) {
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [connectionError, setConnectionError] = useState(null)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  const handleError = useCallback((error) => {
    console.error('LiveKit error:', error)
    setConnectionError(error.message || 'Connection failed')
  }, [])

  if (connectionError) {
    return (
      <div className="h-full flex flex-col bg-black">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
            <p className="text-gray-400 mb-4">{connectionError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      video={true}
      audio={true}
      onError={handleError}
      data-lk-theme="default"
      className="h-full flex flex-col bg-black"
    >
      {/* Audio renderer for other participants */}
      <RoomAudioRenderer />

      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[hsl(0,0%,9%)] border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center border border-green-500/30">
            <Video className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <h1 className="font-semibold text-white text-sm">{roomName}</h1>
            <p className="text-xs text-gray-500 font-mono">{roomId}</p>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-medium border border-green-500/30">
            Live
          </span>
          {isScreenSharing && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium border border-cyan-500/30 flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              Sharing
            </span>
          )}
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
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Video Grid */}
        <div className={`flex-1 transition-all ${isChatOpen ? 'md:mr-80' : ''}`}>
          <VideoGrid />
        </div>

        {/* Chat Panel */}
        <RoomChat
          roomId={roomId}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      </div>

      {/* Controls */}
      <ControlsBar
        onLeave={onLeave}
        isChatOpen={isChatOpen}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        onScreenShareChange={setIsScreenSharing}
        onToast={onToast}
      />
    </LiveKitRoom>
  )
}
