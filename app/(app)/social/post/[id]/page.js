'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, Share2, MoreHorizontal, CheckCircle } from 'lucide-react'
import { getPostWithUser, formatRelativeTime } from '@/lib/mock/posts'
import { isPostLiked, toggleLike, formatCount } from '@/lib/social/reactions'
import { getCommentCount } from '@/lib/mock/comments'
import CommentList from '@/components/social/CommentList'
import ReactionBar from '@/components/social/ReactionBar'
import { useToast } from '@/components/ui/ToastProvider'

export default function PostDetailPage({ params }) {
  const router = useRouter()
  const { toast } = useToast()
  const postId = params.id
  
  const [post, setPost] = useState(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [commentCount, setCommentCount] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const loadedPost = getPostWithUser(postId)
    if (loadedPost) {
      setPost(loadedPost)
      setLikeCount(loadedPost.likes)
      setCommentCount(getCommentCount(postId))
      
      const liked = isPostLiked(postId)
      setIsLiked(liked)
      if (liked) {
        setLikeCount(loadedPost.likes + 1)
      }
    }
  }, [postId])

  const handleLike = () => {
    const newLiked = toggleLike(postId)
    setIsLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
    if (newLiked) {
      toast({ type: 'info', message: '❤️ Liked!' })
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/social/post/${postId}`
    navigator.clipboard.writeText(url)
    toast({ type: 'success', message: 'Link copied!' })
  }

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-12 bg-gray-800/50 rounded-xl animate-pulse" />
        <div className="h-64 bg-gray-800/50 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-800/50 rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-gray-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Post Not Found</h2>
          <p className="text-gray-400 mb-4">This post may have been removed or doesn&apos;t exist.</p>
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

  const user = post.user

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Post Card */}
      <div className="bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 overflow-hidden">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <Link href={`/u/${user.username}`} className="flex items-center gap-3 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-full h-full rounded-full object-cover bg-gray-900"
                />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                    {user.displayName}
                  </span>
                  {user.verified && (
                    <CheckCircle className="w-4 h-4 text-purple-400 fill-purple-400" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>@{user.username}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                </div>
              </div>
            </Link>
            
            <button className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pb-4">
          <p className="text-white text-lg whitespace-pre-wrap leading-relaxed">{post.content}</p>
        </div>

        {/* Image/Video */}
        {post.type === 'image' && post.imageUrl && (
          <div className="relative bg-gray-900">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="w-full max-h-[500px] object-contain"
            />
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-3 border-t border-gray-800/50">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span><strong className="text-white">{formatCount(likeCount)}</strong> likes</span>
            <span><strong className="text-white">{commentCount}</strong> comments</span>
            <span><strong className="text-white">{formatCount(post.shares)}</strong> shares</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-gray-800/50">
          <ReactionBar
            postId={postId}
            likes={likeCount}
            comments={commentCount}
            shares={post.shares}
          />
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6 bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h2 className="font-semibold text-white">Comments ({commentCount})</h2>
        </div>
        <div className="h-[400px] flex flex-col">
          <CommentList postId={postId} />
        </div>
      </div>
    </div>
  )
}
