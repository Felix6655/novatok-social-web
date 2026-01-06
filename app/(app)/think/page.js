'use client'

import { Lightbulb, Plus } from 'lucide-react'

export default function ThinkPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <Lightbulb className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Think</h1>
            <p className="text-sm text-gray-400">Share your thoughts with the world</p>
          </div>
        </div>
        <button className="p-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 transition-all duration-200 hover:scale-105">
          <Plus className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Content Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Your thoughts feed</h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            This is where you'll see thoughts from people you follow. Start sharing your ideas!
          </p>
        </div>
      </div>
    </div>
  )
}
