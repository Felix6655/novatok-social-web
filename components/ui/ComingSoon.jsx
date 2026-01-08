'use client'

import Link from 'next/link'
import { Home, Clock, Sparkles } from 'lucide-react'

export default function ComingSoon({ 
  title = 'Coming Soon',
  description = 'This feature is currently under development.',
  icon: Icon = Clock,
  showHomeButton = true,
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-fade-in">
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
          <Icon className="w-10 h-10 text-purple-400" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
          <Sparkles className="w-3 h-3 text-amber-400" />
        </div>
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>
      <p className="text-gray-500 mb-6 max-w-md">{description}</p>
      
      {showHomeButton && (
        <Link
          href="/home"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      )}
    </div>
  )
}
