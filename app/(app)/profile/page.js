'use client'

import { useState, useEffect, useMemo } from 'react'
import { User, Settings, Calendar, Edit3, Lightbulb, MessageCircle, LogOut, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getProfile } from '@/lib/profile/storage'
import { getThoughtCount } from '@/lib/think/storage'
import { signOut, supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/ToastProvider'

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [profile, setProfile] = useState(null)
  const [thoughtCount, setThoughtCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadProfileData()
  }, [])

  async function loadProfileData() {
    try {
      const [profileData, thoughts] = await Promise.all([
        getProfile(),
        getThoughtCount()
      ])
      setProfile(profileData)
      setThoughtCount(thoughts)
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true)
    try {
      await signOut()
      toast({ type: 'success', message: 'Signed out successfully' })
      router.push('/login')
    } catch (error) {
      toast({ type: 'error', message: 'Failed to sign out' })
      setIsSigningOut(false)
    }
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-12 bg-gray-800/50 rounded-xl w-48" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
    )
  }

  const displayName = profile?.displayName || 'NovaTok User'
  const bio = profile?.bio || 'No bio yet'
  const joinDate = profile?.updatedAt 
    ? new Date(profile.updatedAt).getFullYear() 
    : new Date().getFullYear()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <User className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Profile</h1>
            <p className="text-sm text-gray-500">Your public profile</p>
          </div>
        </div>
        <button className="p-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors">
          <Settings className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-purple-600/40 to-pink-600/40 relative">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iNCIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        </div>

        {/* Profile Info */}
        <div className="px-5 pb-5">
          {/* Avatar */}
          <div className="relative -mt-10 mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-[hsl(0,0%,7%)] shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Name & Bio */}
          <div className="space-y-3">
            <div>
              <h2 className="text-xl font-bold text-white">{displayName}</h2>
              <p className="text-gray-500 text-sm">@{displayName.toLowerCase().replace(/\s+/g, '')}</p>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{bio}</p>
            
            {/* Meta Info */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Joined {joinDate}
              </span>
            </div>

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t border-gray-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <span className="text-white font-bold">{isLoading ? '-' : thoughtCount}</span>
                  <span className="text-gray-500 text-sm ml-1">Thoughts</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <span className="text-white font-bold">0</span>
                  <span className="text-gray-500 text-sm ml-1">Chats</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Button */}
      <Link
        href="/profile/edit"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-purple-500/30 text-white font-medium hover:bg-purple-500/10 transition-colors active:scale-[0.98]"
      >
        <Edit3 className="w-4 h-4" />
        Edit Profile
      </Link>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 transition-colors active:scale-[0.98] disabled:opacity-50"
      >
        {isSigningOut ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing out...</span>
          </>
        ) : (
          <>
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </>
        )}
      </button>
    </div>
  )
}
