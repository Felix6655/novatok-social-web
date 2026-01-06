'use client'

import { useState, useEffect } from 'react'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { isPostLiked, toggleLike, formatCount, getUserReaction, setReaction, REACTION_TYPES, REACTION_EMOJIS } from '@/lib/social/reactions'
import { useToast } from '@/components/ui/ToastProvider'

export default function ReactionBar({ postId, likes, comments, shares, showReactions = true }) {
  const { toast } = useToast()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(likes)
  const [currentReaction, setCurrentReaction] = useState(null)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const liked = isPostLiked(postId)
    setIsLiked(liked)
    if (liked) {
      setLikeCount(likes + 1)
    }
    setCurrentReaction(getUserReaction(postId))
  }, [postId, likes])

  const handleLike = () => {
    const newLiked = toggleLike(postId)
    setIsLiked(newLiked)
    setLikeCount(prev => newLiked ? prev + 1 : prev - 1)
    if (newLiked) {
      toast({ type: 'info', message: '❤️ Liked!' })
    }
  }

  const handleReaction = (type) => {
    if (currentReaction === type) {
      setReaction(postId, null)
      setCurrentReaction(null)
      toast({ type: 'info', message: 'Reaction removed' })
    } else {
      setReaction(postId, type)
      setCurrentReaction(type)
      toast({ type: 'info', message: `Reacted ${REACTION_EMOJIS[type]}` })
    }
    setShowReactionPicker(false)
  }

  const handleShare = () => {
    const url = `${window.location.origin}/social/post/${postId}`
    navigator.clipboard.writeText(url)
    toast({ type: 'success', message: 'Link copied!' })
  }

  if (!mounted) {
    return (
      <div className="flex items-center gap-6">
        <div className="h-6 bg-gray-800 rounded w-16 animate-pulse" />
        <div className="h-6 bg-gray-800 rounded w-16 animate-pulse" />
        <div className="h-6 bg-gray-800 rounded w-16 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-6">
      {/* Like with long press for reactions */}
      <div className="relative">
        <button
          onClick={handleLike}
          onMouseEnter={() => showReactions && setShowReactionPicker(true)}
          onMouseLeave={() => setShowReactionPicker(false)}
          className={`flex items-center gap-2 transition-colors ${
            isLiked || currentReaction
              ? 'text-red-400'
              : 'text-gray-400 hover:text-red-400'
          }`}
        >
          {currentReaction ? (
            <span className="text-lg">{REACTION_EMOJIS[currentReaction]}</span>
          ) : (
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          )}
          <span className="text-sm font-medium">{formatCount(likeCount)}</span>
        </button>

        {/* Reaction Picker */}
        {showReactionPicker && showReactions && (
          <div 
            className="absolute bottom-full left-0 mb-2 flex items-center gap-1 p-2 rounded-xl bg-gray-800 border border-gray-700 shadow-xl"
            onMouseEnter={() => setShowReactionPicker(true)}
            onMouseLeave={() => setShowReactionPicker(false)}
          >
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <button
                key={type}
                onClick={() => handleReaction(type)}
                className={`p-2 text-xl hover:scale-125 transition-transform rounded-lg ${
                  currentReaction === type ? 'bg-gray-700' : 'hover:bg-gray-700'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comments */}
      <button className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">{formatCount(comments)}</span>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm font-medium">{formatCount(shares)}</span>
      </button>
    </div>
  )
}
