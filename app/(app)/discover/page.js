'use client'

import { Users, Search, Sparkles, TrendingUp, Star } from 'lucide-react'
import Link from 'next/link'

export default function DiscoverPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Discover Creators</h1>
          <p className="text-sm text-gray-500">Find people to follow</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search creators..."
          className="w-full pl-12 pr-4 py-3 bg-[hsl(0,0%,7%)] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-colors"
        />
      </div>

      {/* Coming Soon Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-6">
        <div className="text-center py-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <Sparkles className="w-10 h-10 text-blue-400" />
          </div>
          
          {/* Message */}
          <h2 className="text-xl font-semibold text-white mb-2">Discover Coming Soon</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-6">
            We&apos;re building something amazing. Soon you&apos;ll be able to discover and follow incredible creators.
          </p>

          {/* Preview Cards */}
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Trending</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
              <Star className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Featured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back Link */}
      <Link
        href="/notifications"
        className="block text-center text-sm text-gray-500 hover:text-gray-400 transition-colors"
      >
        ← Back to Notifications
      </Link>
    </div>
  )
}
