'use client'

import { useState, useEffect } from 'react'
import { User, ArrowLeft, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useToast } from '@/components/ui/ToastProvider'
import { getProfile, saveProfile } from '@/lib/profile/storage'

export default function EditProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')

  useEffect(() => {
    setMounted(true)
    const profile = getProfile()
    if (profile) {
      setDisplayName(profile.displayName || '')
      setBio(profile.bio || '')
    }
  }, [])

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({ type: 'error', message: 'Display name is required' })
      return
    }

    setIsLoading(true)

    try {
      await saveProfile({
        displayName: displayName.trim(),
        bio: bio.trim()
      })
      toast({ type: 'success', message: 'Profile updated ✓' })
      router.push('/profile')
    } catch (error) {
      toast({ type: 'error', message: error.message || 'Failed to save profile' })
    } finally {
      setIsLoading(false)
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/profile"
          className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-400" />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <User className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Edit Profile</h1>
            <p className="text-sm text-gray-500">Update your information</p>
          </div>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="bg-[hsl(0,0%,7%)] rounded-2xl border border-gray-800 p-5">
        <div className="space-y-5">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center border-4 border-gray-800 shadow-lg">
              <User className="w-10 h-10 text-white" />
            </div>
          </div>

          {/* Display Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your display name"
              maxLength={50}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors disabled:opacity-50"
            />
            <p className="text-xs text-gray-600 text-right">{displayName.length}/50</p>
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the world about yourself..."
              maxLength={160}
              rows={4}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-colors resize-none disabled:opacity-50"
            />
            <p className="text-xs text-gray-600 text-right">{bio.length}/160</p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isLoading}
        className={`
          w-full py-3.5 rounded-xl font-semibold text-white
          flex items-center justify-center gap-2
          transition-all duration-200 ease-out
          active:scale-[0.98]
          ${isLoading
            ? 'bg-gray-700 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25'
          }
        `}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Saving...</span>
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            <span>Save Changes</span>
          </>
        )}
      </button>
    </div>
  )
}
