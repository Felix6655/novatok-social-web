'use client'

import { MessageCircle, Search, Heart, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'
import { useState } from 'react'

export default function MessagesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSoulMatchClick = () => {
    toast({ type: 'info', message: 'SoulMatch coming soon' })
    router.push('/soulmatch')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
          <MessageCircle className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Messages</h1>
          <p className="text-sm text-gray-500">Your conversations</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search messages..."
          className="w-full pl-12 pr-4 py-3 bg-[hsl(0,0%,7%)] border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 transition-colors"
        />
      </div>

      {/* Empty State Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
        <div className="text-center py-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20">
            <MessageCircle className="w-10 h-10 text-green-400" />
          </div>
          
          {/* Message */}
          <h2 className="text-xl font-semibold text-white mb-2">No messages yet</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            Start a conversation with someone new.
          </p>
          
          {/* CTA Button */}
          <button
            onClick={handleSoulMatchClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 active:scale-[0.98]"
          >
            <Heart className="w-5 h-5" />
            Find Your Match
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
