'use client'

import { Heart, MessageCircle, X } from 'lucide-react'

/**
 * Match Modal - Shows when user gets a match
 */
export default function MatchModal({ profile, onClose, onMessage }) {
  if (!profile) return null
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
      <div className="relative max-w-sm w-full">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Content */}
        <div className="text-center">
          {/* Hearts animation */}
          <div className="relative mb-6">
            <div className="flex justify-center gap-4">
              <Heart className="w-16 h-16 text-pink-500 animate-pulse" fill="currentColor" />
              <Heart className="w-16 h-16 text-rose-500 animate-pulse delay-100" fill="currentColor" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl animate-bounce">✨</span>
            </div>
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent mb-2">
            It's a Match!
          </h2>
          <p className="text-gray-400 mb-6">
            You and <span className="text-white font-medium">{profile.displayName || profile.firstName}</span> liked each other
          </p>
          
          {/* Profile preview */}
          <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500/30 to-rose-500/30 mx-auto mb-3 flex items-center justify-center border-2 border-pink-500/30">
              <span className="text-3xl">💕</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {profile.displayName || profile.firstName}, {profile.age}
            </h3>
            <p className="text-gray-500 text-sm">
              {profile.city}, {profile.state}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium hover:bg-gray-800 transition-colors"
            >
              Keep Swiping
            </button>
            <button
              onClick={() => onMessage?.(profile)}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 text-white font-medium hover:from-pink-500 hover:to-rose-500 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Message
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
