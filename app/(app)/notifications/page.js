'use client'

import { Bell, Settings } from 'lucide-react'

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
            <Bell className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="text-sm text-gray-400">Stay updated with your activity</p>
          </div>
        </div>
        <button className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Content Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No notifications yet</h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            When someone interacts with your content, you'll see it here.
          </p>
        </div>
      </div>
    </div>
  )
}
