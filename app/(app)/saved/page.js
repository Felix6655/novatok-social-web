'use client'

import { Bookmark, FolderOpen, Tag, Clock } from 'lucide-react'

export default function SavedPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center border border-amber-500/30">
          <Bookmark className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Saved</h1>
          <p className="text-sm text-gray-500">Your saved content</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
        <div className="text-center py-12">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-yellow-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-500/10 to-yellow-500/10 flex items-center justify-center border border-amber-500/30">
              <FolderOpen className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Saved Items Coming Soon</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            Save posts, readings, and content for later. Organize with collections and tags.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <Bookmark className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Quick Save</p>
            </div>
            <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
              <FolderOpen className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Collections</p>
            </div>
            <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <Tag className="w-6 h-6 text-orange-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Tags</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
