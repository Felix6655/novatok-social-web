'use client'

import { Bell, Users, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

export default function NotificationsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleDiscoverClick = () => {
    toast({ type: 'info', message: 'Discover coming soon' })
    router.push('/discover')
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center border border-blue-500/30">
          <Bell className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white">Notifications</h1>
          <p className="text-sm text-gray-500">Stay updated with activity</p>
        </div>
      </div>

      {/* Empty State Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-8">
        <div className="text-center py-8">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            <Bell className="w-10 h-10 text-blue-400" />
          </div>
          
          {/* Message */}
          <h2 className="text-xl font-semibold text-white mb-2">No notifications yet</h2>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">
            Follow creators to see updates here.
          </p>
          
          {/* CTA Button */}
          <button
            onClick={handleDiscoverClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-xl text-white font-medium transition-all duration-200 hover:scale-105 active:scale-[0.98]"
          >
            <Users className="w-5 h-5" />
            Discover Creators
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
