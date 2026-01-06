'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Share2, MoreHorizontal, Play, CheckCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/mock/posts'
import { isPostLiked, toggleLike, formatCount } from '@/lib/social/reactions'
import { useToast } from '@/components/ui/ToastProvider'

export default function FeedPost({ post, onCommentClick }) {
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const liked = isPostLiked(post.id)
    setIsLiked(liked)
    if (liked) {
      setLikeCount(post.likes + 1)
    }
  }, [post.id, post.likes])

  const handleLike = () => {
    const newLiked = toggleLike(post.id)
    setIsLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
    if (newLiked) {
      toast({ type: 'info', message: '❤️ Liked!' })
    }
  }

  const handleShare = () => {
    const url = `${window.location.origin}/social/post/${post.id}`
    navigator.clipboard.writeText(url)
    toast({ type: 'success', message: 'Link copied!' })
  }

  const handleComment = () => {
    if (onCommentClick) {
      onCommentClick(post.id)
    }
  }

  if (!mounted) {
    return (
      <div className="bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 p-4 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-800" />
          <div className="flex-1">
            <div className="h-4 bg-gray-800 rounded w-24 mb-1" />
            <div className="h-3 bg-gray-800 rounded w-16" />
          </div>
        </div>
        <div className="h-16 bg-gray-800 rounded" />
      </div>
    )
  }

  const user = post.user

  return (
    <div className="bg-[hsl(0,0%,9%)] rounded-2xl border border-gray-800 overflow-hidden transition-all hover:border-gray-700">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <Link href={`/u/${user.username}`} className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-[2px]">
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
              <span className="text-sm text-gray-500">@{user.username}</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{formatRelativeTime(post.createdAt)}</span>
            <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-white whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {/* Image/Video */}
      {post.type === 'image' && post.imageUrl && (
        <div className="relative aspect-[4/3] bg-gray-900">
          <img
            src={post.imageUrl}
            alt="Post image"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {post.type === 'video' && post.videoUrl && (
        <div className="relative aspect-video bg-gray-900">
          <video
            src={post.videoUrl}
            className="w-full h-full object-cover"
            controls
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-4 pt-3 border-t border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                isLiked 
                  ? 'text-red-400' 
                  : 'text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{formatCount(likeCount)}</span>
            </button>

            {/* Comment */}
            <Link
              href={`/social/post/${post.id}`}
              onClick={handleComment}
              className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{formatCount(post.comments)}</span>
            </Link>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Share2 className="w-5 h-5" />
              <span className="text-sm font-medium">{formatCount(post.shares)}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
