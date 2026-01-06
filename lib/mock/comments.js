// Mock comments data and localStorage persistence for Social Feed

import { MOCK_USERS, getDemoUser } from './users'

const COMMENTS_KEY = 'novatok_social_comments'

// Initial mock comments (seeded data)
export const INITIAL_COMMENTS = {
  'post_1': [
    {
      id: 'comment_1_1',
      postId: 'post_1',
      userId: 'user_3',
      content: 'This is exactly what I needed to hear today! 🙏',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      likes: 12
    },
    {
      id: 'comment_1_2',
      postId: 'post_1',
      userId: 'user_6',
      content: 'The universe has been speaking to me too lately. What a beautiful journey.',
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
      likes: 8
    }
  ],
  'post_2': [
    {
      id: 'comment_2_1',
      postId: 'post_2',
      userId: 'user_1',
      content: 'As a Scorpio, I\'m both excited and terrified 😅',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      likes: 45
    },
    {
      id: 'comment_2_2',
      postId: 'post_2',
      userId: 'user_4',
      content: 'Time to triple check all my emails before sending!',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      likes: 23
    },
    {
      id: 'comment_2_3',
      postId: 'post_2',
      userId: 'user_3',
      content: 'Thanks for the heads up! Saving this for reference 📌',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
      likes: 18
    }
  ],
  'post_3': [
    {
      id: 'comment_3_1',
      postId: 'post_3',
      userId: 'user_5',
      content: 'Sharing this with everyone I know. Such wisdom! 💫',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      likes: 67
    }
  ],
  'post_5': [
    {
      id: 'comment_5_1',
      postId: 'post_5',
      userId: 'user_1',
      content: '3 AM gang rise up! 🌙',
      createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
      likes: 34
    },
    {
      id: 'comment_5_2',
      postId: 'post_5',
      userId: 'user_2',
      content: 'That\'s when I do my best creative work tbh',
      createdAt: new Date(Date.now() - 1000 * 60 * 280).toISOString(),
      likes: 28
    }
  ]
}

/**
 * Get all comments from localStorage (with initial data merge)
 * @returns {Object}
 */
export function getAllComments() {
  if (typeof window === 'undefined') return INITIAL_COMMENTS
  
  try {
    const stored = localStorage.getItem(COMMENTS_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    // Initialize with mock data
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(INITIAL_COMMENTS))
    return INITIAL_COMMENTS
  } catch {
    return INITIAL_COMMENTS
  }
}

/**
 * Get comments for a specific post
 * @param {string} postId
 * @returns {Array}
 */
export function getCommentsForPost(postId) {
  const all = getAllComments()
  return all[postId] || []
}

/**
 * Get comments with user data
 * @param {string} postId
 * @returns {Array}
 */
export function getCommentsWithUsers(postId) {
  const comments = getCommentsForPost(postId)
  return comments.map(comment => {
    const user = MOCK_USERS.find(u => u.id === comment.userId) || getDemoUser()
    return { ...comment, user }
  })
}

/**
 * Add a comment to a post
 * @param {string} postId
 * @param {string} content
 * @returns {Object} The new comment
 */
export function addComment(postId, content) {
  if (typeof window === 'undefined') return null
  
  const all = getAllComments()
  const demoUser = getDemoUser()
  
  const newComment = {
    id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    postId,
    userId: demoUser.id,
    content,
    createdAt: new Date().toISOString(),
    likes: 0
  }
  
  if (!all[postId]) {
    all[postId] = []
  }
  
  all[postId].push(newComment)
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(all))
  
  return { ...newComment, user: demoUser }
}

/**
 * Get comment count for a post
 * @param {string} postId
 * @returns {number}
 */
export function getCommentCount(postId) {
  const comments = getCommentsForPost(postId)
  return comments.length
}

/**
 * Format comment time
 * @param {string} timestamp
 * @returns {string}
 */
export function formatCommentTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
