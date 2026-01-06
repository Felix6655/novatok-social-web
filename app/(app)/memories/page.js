'use client'

import { Image, Clock, Heart, Calendar } from 'lucide-react'

export default function MemoriesPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center border border-pink-500/30">
          <Image className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Memories</h1>
          <p className="text-sm text-gray-500">Relive your moments</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
        <div className="text-center py-12">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center border border-pink-500/30">
              <Clock className="w-10 h-10 text-pink-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Memories Coming Soon</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            We&apos;ll surface your favorite moments from the past — thoughts, photos, and milestones.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-4 rounded-xl bg-pink-500/10 border border-pink-500/20">
              <Calendar className="w-6 h-6 text-pink-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">On This Day</p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <Heart className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Favorites</p>
            </div>
            <div className="p-4 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20">
              <Image className="w-6 h-6 text-fuchsia-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Photo Recap</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
