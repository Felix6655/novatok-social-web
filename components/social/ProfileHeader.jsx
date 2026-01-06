'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, MapPin, Calendar, Link as LinkIcon } from 'lucide-react'
import { formatCount } from '@/lib/mock/users'
import { useToast } from '@/components/ui/ToastProvider'

export default function ProfileHeader({ user, isOwnProfile = false }) {
  const { toast } = useToast()
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(user.stats.followers)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check localStorage for follow state
    if (typeof window !== 'undefined') {
      const follows = JSON.parse(localStorage.getItem('novatok_social_follows') || '{}')
      setIsFollowing(!!follows[user.id])
    }
  }, [user.id])

  const handleFollow = () => {
    const follows = JSON.parse(localStorage.getItem('novatok_social_follows') || '{}')
    const newState = !isFollowing
    
    if (newState) {
      follows[user.id] = true
      setFollowerCount(prev => prev + 1)
      toast({ type: 'success', message: `Following @${user.username}!` })
    } else {
      delete follows[user.id]
      setFollowerCount(prev => prev - 1)
      toast({ type: 'info', message: `Unfollowed @${user.username}` })
    }
    
    localStorage.setItem('novatok_social_follows', JSON.stringify(follows))
    setIsFollowing(newState)
  }

  const handleShareProfile = () => {
    const url = `${window.location.origin}/u/${user.username}`
    navigator.clipboard.writeText(url)
    toast({ type: 'success', message: 'Profile link copied!' })
  }

  if (!mounted) {
    return (
      <div className="bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 p-6 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-gray-800" />
          <div className="flex-1">
            <div className="h-6 bg-gray-800 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-800 rounded w-24" />
          </div>
        </div>
      </div>
    )
  }

  const joinDate = new Date(user.joinedAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 overflow-hidden">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-purple-600/30 via-pink-500/30 to-orange-500/30" />
      
      {/* Profile Content */}
      <div className="p-6 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-[3px]">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-full h-full rounded-full object-cover bg-gray-900"
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex-1 flex items-center justify-between sm:justify-end gap-2">
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="px-4 py-2 rounded-xl border border-gray-700 text-white font-medium hover:bg-gray-800 transition-colors text-sm"
              >
                Edit Profile
              </Link>
            ) : (
              <button
                onClick={handleFollow}
                className={`px-5 py-2 rounded-xl font-medium transition-all text-sm ${
                  isFollowing
                    ? 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
                    : 'bg-purple-500 text-white hover:bg-purple-600'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            <button
              onClick={handleShareProfile}
              className="p-2 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <LinkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">{user.displayName}</h1>
            {user.verified && (
              <CheckCircle className="w-5 h-5 text-purple-400 fill-purple-400" />
            )}
          </div>
          <p className="text-gray-500">@{user.username}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-gray-300 mt-3 leading-relaxed">{user.bio}</p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Joined {joinDate}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-800">
          <div className="text-center">
            <span className="block text-lg font-bold text-white">{formatCount(user.stats.posts)}</span>
            <span className="text-sm text-gray-500">Posts</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-white">{formatCount(followerCount)}</span>
            <span className="text-sm text-gray-500">Followers</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-white">{formatCount(user.stats.following)}</span>
            <span className="text-sm text-gray-500">Following</span>
          </div>
          <div className="text-center">
            <span className="block text-lg font-bold text-white">{formatCount(user.stats.likes)}</span>
            <span className="text-sm text-gray-500">Likes</span>
          </div>
        </div>
      </div>
    </div>
  )
}
