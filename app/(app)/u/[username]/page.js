'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Grid, Film, User } from 'lucide-react'
import ProfileHeader from '@/components/social/ProfileHeader'
import FeedPost from '@/components/social/FeedPost'
import { getUserByUsername, getDemoUser } from '@/lib/mock/users'
import { getPostsByUserId, getAllPostsWithUsers } from '@/lib/mock/posts'
import { useToast } from '@/components/ui/ToastProvider'

// Tabs
const TABS = [
  { id: 'posts', label: 'Posts', icon: Grid },
  { id: 'reels', label: 'Reels', icon: Film }
]

export default function UserProfilePage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const username = params.username
  
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('posts')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get user
    const loadedUser = getUserByUsername(username)
    if (loadedUser) {
      setUser(loadedUser)
      
      // Get user's posts with full user data
      const allPosts = getAllPostsWithUsers()
      const userPosts = allPosts.filter(p => p.userId === loadedUser.id)
      setPosts(userPosts)
    }
  }, [username])

  const handleCommentClick = (postId) => {
    router.push(`/social/post/${postId}`)
  }

  const isOwnProfile = user?.id === getDemoUser().id

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-12 bg-gray-800/50 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-800/50 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-800/50 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-4">The user @{username} doesn&apos;t exist.</p>
          <Link
            href="/social"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Back Button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Profile Header */}
      <ProfileHeader user={user} isOwnProfile={isOwnProfile} />

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800">
              <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
                <Grid className="w-6 h-6 text-gray-600" />
              </div>
              <p className="text-gray-500">No posts yet</p>
            </div>
          ) : (
            posts.map(post => (
              <FeedPost
                key={post.id}
                post={post}
                onCommentClick={handleCommentClick}
              />
            ))
          )}
        </div>
      )}

      {activeTab === 'reels' && (
        <div className="grid grid-cols-3 gap-1">
          {/* Placeholder reels grid */}
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="aspect-[9/16] bg-gray-800 rounded-lg flex items-center justify-center"
            >
              <Film className="w-8 h-8 text-gray-600" />
            </div>
          ))}
          {posts.length === 0 && (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No reels yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
