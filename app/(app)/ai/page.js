'use client'

import { Bot, MessageSquare, Sparkles, Zap } from 'lucide-react'

export default function AIPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
          <Bot className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Chat with AIs</h1>
          <p className="text-sm text-gray-500">AI-powered conversations</p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
        <div className="text-center py-12">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 flex items-center justify-center border border-cyan-500/30">
              <MessageSquare className="w-10 h-10 text-cyan-400" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">AI Chat Coming Soon</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            Chat with various AI personalities for advice, creativity, learning, and entertainment.
          </p>

          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
              <Sparkles className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Creative AI</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <Bot className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Coach AI</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Zap className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Expert AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
