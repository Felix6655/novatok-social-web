'use client'

import { MessageCircle, Search, Edit } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
            <MessageCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Messages</h1>
            <p className="text-sm text-gray-400">Your conversations</p>
          </div>
        </div>
        <button className="p-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 transition-all duration-200 hover:scale-105">
          <Edit className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Search messages..."
          className="w-full pl-12 pr-4 py-3 bg-[hsl(0,0%,7%)] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-colors"
        />
      </div>

      {/* Content Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No messages yet</h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            Start a conversation with someone and it will appear here.
          </p>
        </div>
      </div>
    </div>
  )
}
