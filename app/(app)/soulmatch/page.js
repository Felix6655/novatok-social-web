'use client'

import { Heart, Sparkles, Users, MessageCircle, Zap } from 'lucide-react'
import Link from 'next/link'

export default function SoulMatchPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center border border-pink-500/30">
          <Heart className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">SoulMatch</h1>
          <p className="text-sm text-gray-500">Find your perfect match</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-gradient-to-br from-pink-900/20 to-rose-900/20 rounded-2xl border border-pink-500/20 p-6">
        <div className="text-center py-8">
          {/* Animated Icon */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/20 to-rose-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-500/10 to-rose-500/10 flex items-center justify-center border border-pink-500/30">
              <Heart className="w-10 h-10 text-pink-400" />
            </div>
          </div>
          
          {/* Message */}
          <h2 className="text-2xl font-bold text-white mb-2">SoulMatch Coming Soon</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            Connect with people who share your vibe. AI-powered matching based on your thoughts and interests.
          </p>

          {/* Feature Preview */}
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-3 rounded-xl bg-black/20 border border-pink-500/10">
              <Sparkles className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">AI Matching</p>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-pink-500/10">
              <Users className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Real People</p>
            </div>
            <div className="p-3 rounded-xl bg-black/20 border border-pink-500/10">
              <Zap className="w-5 h-5 text-pink-400 mx-auto mb-1" />
              <p className="text-xs text-gray-500">Instant Chat</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teaser */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-white">Get Notified</h3>
            <p className="text-sm text-gray-500">Be the first to know when SoulMatch launches</p>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <Link
        href="/messages"
        className="block text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
      >
        ← Back to Messages
      </Link>
    </div>
  )
}
