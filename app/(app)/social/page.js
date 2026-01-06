'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Users, TrendingUp, Sparkles, RefreshCw } from 'lucide-react'
import FeedPost from '@/components/social/FeedPost'
import { getAllPostsWithUsers } from '@/lib/mock/posts'
import { useToast } from '@/components/ui/ToastProvider'

export default function SocialFeedPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [posts, setPosts] = useState([])
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const POSTS_PER_PAGE = 5

  useEffect(() => {
    setMounted(true)
    loadPosts()
  }, [])

  const loadPosts = () => {
    const allPosts = getAllPostsWithUsers()
    setPosts(allPosts)
  }

  const handleLoadMore = async () => {
    setIsLoading(true)
    // Simulate loading delay
    await new Promise(r => setTimeout(r, 500))
    setPage(prev => prev + 1)
    setIsLoading(false)
    toast({ type: 'info', message: 'Loaded more posts' })
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))
    loadPosts()
    setPage(1)
    setIsLoading(false)
    toast({ type: 'success', message: 'Feed refreshed!' })
  }

  const handleCommentClick = (postId) => {
    router.push(`/social/post/${postId}`)
  }

  // Get visible posts based on pagination
  const visiblePosts = posts.slice(0, page * POSTS_PER_PAGE)
  const hasMore = visiblePosts.length < posts.length

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-16 bg-gray-800/50 rounded-2xl animate-pulse" />
        {[1, 2, 3].map(i => (
          <div key={i} className="h-64 bg-gray-800/50 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center border border-purple-500/30">
            <Users className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">Social Feed</h1>
            <p className="text-sm text-gray-500">See what everyone&apos;s sharing</p>
          </div>
        </div>
        
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <button className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 text-sm font-medium whitespace-nowrap">
          For You
        </button>
        <button className="px-4 py-2 rounded-xl bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium whitespace-nowrap">
          <TrendingUp className="w-4 h-4 inline mr-1" />
          Trending
        </button>
        <button className="px-4 py-2 rounded-xl bg-gray-800/50 text-gray-400 border border-gray-700 hover:text-white hover:bg-gray-800 transition-colors text-sm font-medium whitespace-nowrap">
          <Sparkles className="w-4 h-4 inline mr-1" />
          Following
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {visiblePosts.map(post => (
          <FeedPost
            key={post.id}
            post={post}
            onCommentClick={handleCommentClick}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-4">
          <button
            onClick={handleLoadMore}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl bg-gray-800 text-white font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* End of Feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8 border-t border-gray-800">
          <p className="text-gray-500">You&apos;re all caught up! 🎉</p>
          <p className="text-sm text-gray-600 mt-1">Check back later for more posts</p>
        </div>
      )}
    </div>
  )
}
