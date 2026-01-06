'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Video, Plus, LogIn, Clock, Trash2, Users, Copy, ArrowRight
} from 'lucide-react'
import {
  generateRoomId,
  getRecentRooms,
  removeRecentRoom,
  formatLastJoined
} from '@/lib/rooms/storage'
import { useToast } from '@/components/ui/ToastProvider'

export default function RoomsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [recentRooms, setRecentRooms] = useState([])
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    setMounted(true)
    setRecentRooms(getRecentRooms())
  }, [])

  const handleCreateRoom = async () => {
    setIsCreating(true)
    
    // Simulate brief loading
    await new Promise(r => setTimeout(r, 300))
    
    const roomId = generateRoomId()
    const name = roomName.trim() || `Room ${roomId.slice(0, 4).toUpperCase()}`
    
    // Navigate to room
    router.push(`/rooms/${roomId}?name=${encodeURIComponent(name)}`)
  }

  const handleJoinRoom = async () => {
    const code = joinCode.trim().toLowerCase()
    
    if (!code) {
      toast({ type: 'error', message: 'Please enter a room code' })
      return
    }
    
    if (code.length < 4) {
      toast({ type: 'error', message: 'Room code must be at least 4 characters' })
      return
    }
    
    setIsJoining(true)
    
    // Simulate brief loading
    await new Promise(r => setTimeout(r, 300))
    
    router.push(`/rooms/${code}`)
  }

  const handleRemoveRecent = (e, roomId) => {
    e.stopPropagation()
    e.preventDefault()
    removeRecentRoom(roomId)
    setRecentRooms(getRecentRooms())
    toast({ type: 'info', message: 'Removed from history' })
  }

  const handleCopyCode = (e, roomId) => {
    e.stopPropagation()
    e.preventDefault()
    navigator.clipboard.writeText(roomId)
    toast({ type: 'success', message: 'Room code copied!' })
  }

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 mb-4">
          <Video className="w-8 h-8 text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Rooms</h1>
        <p className="text-gray-400">Create or join video rooms to connect with others</p>
      </div>

      {/* Create & Join Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Room Card */}
        <div className="bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center border border-green-500/30">
              <Plus className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Create Room</h2>
              <p className="text-sm text-gray-500">Start a new video room</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Room Name <span className="text-gray-600">(optional)</span>
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="My Awesome Room"
                maxLength={50}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all"
              />
            </div>

            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Room
                </>
              )}
            </button>
          </div>
        </div>

        {/* Join Room Card */}
        <div className="bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <LogIn className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Join Room</h2>
              <p className="text-sm text-gray-500">Enter a room code to join</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toLowerCase())}
                placeholder="abc12345"
                maxLength={20}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={isJoining || !joinCode.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>
                  <ArrowRight className="w-5 h-5" />
                  Join Room
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Rooms */}
      {recentRooms.length > 0 && (
        <div className="bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Recent Rooms</h2>
              <p className="text-sm text-gray-500">Rejoin a previous room</p>
            </div>
          </div>

          <div className="space-y-2">
            {recentRooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}?name=${encodeURIComponent(room.name)}`}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/60 hover:border-gray-600 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 flex-shrink-0">
                    <Users className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-medium text-white truncate">{room.name}</h3>
                    <p className="text-sm text-gray-500 font-mono">{room.id}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 hidden sm:block">
                    {formatLastJoined(room.lastJoined)}
                  </span>
                  
                  <button
                    onClick={(e) => handleCopyCode(e, room.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-700 transition-colors opacity-0 group-hover:opacity-100"
                    title="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleRemoveRecent(e, room.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-3">
        <Video className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-indigo-200">
            <strong>Phase 0:</strong> Room layouts are ready. Video streaming will be enabled in a future update.
          </p>
        </div>
      </div>
    </div>
  )
}
