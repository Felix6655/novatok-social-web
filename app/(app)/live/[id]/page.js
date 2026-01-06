'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Video, Eye, Clock, Heart, MessageCircle, Send, User, 
  ArrowLeft, Share2, Bell, Users, AlertCircle
} from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'
import {
  getLiveSession,
  getLiveMessages,
  addLiveMessage,
  formatLiveTime,
  formatLiveDuration,
  formatViewerCount
} from '@/lib/live/storage'

export default function LiveViewerPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const sessionId = params.id
  
  const [mounted, setMounted] = useState(false)
  const [session, setSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [viewerCount, setViewerCount] = useState(0)
  const [liveDuration, setLiveDuration] = useState('0:00')
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  
  const messagesEndRef = useRef(null)
  const durationIntervalRef = useRef(null)
  const viewerIntervalRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    
    // Load session
    const loadedSession = getLiveSession(sessionId)
    if (loadedSession) {
      setSession(loadedSession)
      setViewerCount(loadedSession.viewerCount || Math.floor(Math.random() * 50) + 5)
      
      // Load messages
      const existingMessages = getLiveMessages(sessionId)
      if (existingMessages.length > 0) {
        setMessages(existingMessages)
      } else {
        // Add join message
        const joinMsg = addLiveMessage(sessionId, {
          type: 'system',
          text: 'You joined the live stream'
        })
        setMessages([joinMsg])
      }
      
      // Start duration timer
      if (loadedSession.status === 'live') {
        durationIntervalRef.current = setInterval(() => {
          setLiveDuration(formatLiveDuration(loadedSession.startedAt))
        }, 1000)
        
        // Fake viewer count changes
        viewerIntervalRef.current = setInterval(() => {
          setViewerCount(prev => {
            const change = Math.random() > 0.4 
              ? Math.floor(Math.random() * 3) 
              : -Math.floor(Math.random() * 2)
            return Math.max(1, prev + change)
          })
        }, 4000)
      }
    }
    
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current)
      if (viewerIntervalRef.current) clearInterval(viewerIntervalRef.current)
    }
  }, [sessionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    const text = messageInput.trim()
    if (!text) return
    
    const newMsg = addLiveMessage(sessionId, {
      type: 'user',
      text,
      sender: 'You'
    })
    
    setMessages(prev => [...prev, newMsg])
    setMessageInput('')
  }

  const handleFollow = () => {
    setIsFollowing(!isFollowing)
    toast({ 
      type: 'success', 
      message: isFollowing ? 'Unfollowed' : 'Following! You\'ll be notified when they go live' 
    })
  }

  const handleLike = () => {
    setIsLiked(!isLiked)
    toast({ type: 'info', message: isLiked ? 'Like removed' : '❤️ Liked!' })
  }

  const handleShare = () => {
    const url = `${window.location.origin}/live/${sessionId}`
    navigator.clipboard.writeText(url)
    toast({ type: 'success', message: 'Live link copied!' })
  }

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    )
  }

  // Session not found
  if (!session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Live Stream Not Found</h2>
          <p className="text-gray-400 mb-4">
            This live stream may have ended or doesn&apos;t exist.
          </p>
          <Link
            href="/live"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <Video className="w-4 h-4" />
            Go Live Yourself
          </Link>
        </div>
      </div>
    )
  }

  const isLiveNow = session.status === 'live'

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/live"
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-white">{session.title}</h1>
          <p className="text-sm text-gray-500">by {session.hostName}</p>
        </div>
        {isLiveNow && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-bold">LIVE</span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Video/Stream Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Video Player Placeholder */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {isLiveNow ? (
                <>
                  {/* Placeholder for live stream */}
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                      <Video className="w-10 h-10 text-red-400" />
                    </div>
                    <p className="text-white font-medium mb-2">Live Stream</p>
                    <p className="text-gray-500 text-sm">Real streaming coming soon</p>
                  </div>
                  
                  {/* Live overlay */}
                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-red-500">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-xs text-white font-bold">LIVE</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5 text-white" />
                      <span className="text-xs text-white font-medium">{formatViewerCount(viewerCount)}</span>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
                      <span className="text-xs text-white font-mono">{liveDuration}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <Video className="w-10 h-10 text-gray-600" />
                  </div>
                  <p className="text-white font-medium mb-2">Stream Ended</p>
                  <p className="text-gray-500 text-sm">This live stream has ended</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  isLiked 
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">Like</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white hover:bg-gray-700 transition-all"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>

            <button
              onClick={handleFollow}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                isFollowing
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              }`}
            >
              <Bell className={`w-5 h-5 ${isFollowing ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{isFollowing ? 'Following' : 'Follow'}</span>
            </button>
          </div>

          {/* Stream Info */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-medium text-white">{session.hostName}</p>
                <p className="text-sm text-gray-500">Host</p>
              </div>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">{session.title}</h2>
            <p className="text-sm text-gray-500">
              Started {new Date(session.startedAt).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="lg:col-span-1">
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 h-[500px] lg:h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-purple-400" />
                <span className="font-medium text-white">Live Chat</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Users className="w-4 h-4" />
                <span className="text-xs">{formatViewerCount(viewerCount)}</span>
              </div>
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
                        <span className="text-xs text-gray-600">{formatLiveTime(msg.timestamp)}</span>
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
                  placeholder="Say something..."
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
      </div>
    </div>
  )
}
