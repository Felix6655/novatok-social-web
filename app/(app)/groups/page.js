'use client'

import Link from 'next/link'
import { Users, MessageCircle, Calendar, Shield, Home } from 'lucide-react'

export default function GroupsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center border border-blue-500/30">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Groups</h1>
          <p className="text-sm text-gray-500">Join communities</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
        <div className="text-center py-12">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center border border-blue-500/30">
              <Users className="w-10 h-10 text-blue-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Groups Coming Soon</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            Create and join communities around shared interests. Connect with like-minded people.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Public Groups</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Shield className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Private Groups</p>
            </div>
            <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <MessageCircle className="w-6 h-6 text-violet-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Discussions</p>
            </div>
          </div>
          
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium transition-colors"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
