'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User } from 'lucide-react'
import { getCommentsWithUsers, addComment, formatCommentTime } from '@/lib/mock/comments'
import { getDemoUser } from '@/lib/mock/users'
import { useToast } from '@/components/ui/ToastProvider'

export default function CommentList({ postId }) {
  const { toast } = useToast()
  const [comments, setComments] = useState([])
  const [input, setInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef(null)
  const listRef = useRef(null)

  useEffect(() => {
    setMounted(true)
    const loadedComments = getCommentsWithUsers(postId)
    setComments(loadedComments)
  }, [postId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    setIsSubmitting(true)
    
    // Simulate brief delay
    await new Promise(r => setTimeout(r, 300))
    
    const newComment = addComment(postId, text)
    if (newComment) {
      setComments(prev => [...prev, newComment])
      setInput('')
      toast({ type: 'success', message: 'Comment added!' })
      
      // Scroll to bottom
      setTimeout(() => {
        listRef.current?.scrollTo({
          top: listRef.current.scrollHeight,
          behavior: 'smooth'
        })
      }, 100)
    }
    
    setIsSubmitting(false)
  }

  if (!mounted) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-800" />
            <div className="flex-1">
              <div className="h-3 bg-gray-800 rounded w-20 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  const demoUser = getDemoUser()

  return (
    <div className="flex flex-col h-full">
      {/* Comments List */}
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-4 px-4 pb-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first!</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex gap-3">
              <img
                src={comment.user?.avatar || demoUser.avatar}
                alt={comment.user?.displayName || 'User'}
                className="w-8 h-8 rounded-full object-cover bg-gray-800 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-medium text-white text-sm">
                    {comment.user?.displayName || 'User'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatCommentTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-300 text-sm break-words">{comment.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <img
            src={demoUser.avatar}
            alt="You"
            className="w-8 h-8 rounded-full object-cover bg-gray-800 flex-shrink-0"
          />
          <div className="flex-1 flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSubmitting}
              className="p-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
