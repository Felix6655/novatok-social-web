// Mock posts data for Social Feed

import { MOCK_USERS } from './users'

// Post content types
export const POST_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  VIDEO: 'video'
}

// Sample image URLs (using Unsplash)
const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=600&q=80',
  'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
  'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=600&q=80',
  'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
]

export const MOCK_POSTS = [
  {
    id: 'post_1',
    userId: 'user_1',
    type: POST_TYPES.TEXT,
    content: 'Just had the most amazing meditation session. The universe really does speak to those who listen. 🌌✨',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    likes: 234,
    comments: 18,
    shares: 5
  },
  {
    id: 'post_2',
    userId: 'user_5',
    type: POST_TYPES.IMAGE,
    content: 'Mercury retrograde starts tomorrow! Here\'s what each sign should prepare for... 🔮',
    imageUrl: SAMPLE_IMAGES[0],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    likes: 892,
    comments: 67,
    shares: 124
  },
  {
    id: 'post_3',
    userId: 'user_3',
    type: POST_TYPES.TEXT,
    content: 'Reminder: You don\'t have to have it all figured out. Growth is a journey, not a destination. Take it one day at a time. 🌱💫',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    likes: 1567,
    comments: 89,
    shares: 234
  },
  {
    id: 'post_4',
    userId: 'user_2',
    type: POST_TYPES.IMAGE,
    content: 'New digital art piece: "Cosmic Connection" - Inspired by last night\'s tarot reading 🎨',
    imageUrl: SAMPLE_IMAGES[1],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    likes: 445,
    comments: 32,
    shares: 28
  },
  {
    id: 'post_5',
    userId: 'user_6',
    type: POST_TYPES.TEXT,
    content: 'Anyone else feel like 3 AM is when all the best thoughts happen? 🌙 The quiet hits different.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    likes: 678,
    comments: 156,
    shares: 12
  },
  {
    id: 'post_6',
    userId: 'user_4',
    type: POST_TYPES.IMAGE,
    content: 'Built a meditation timer app that syncs with lunar phases. Tech and spirituality can coexist! 🌙💻',
    imageUrl: SAMPLE_IMAGES[2],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    likes: 312,
    comments: 45,
    shares: 67
  },
  {
    id: 'post_7',
    userId: 'user_1',
    type: POST_TYPES.TEXT,
    content: 'Today\'s mantra: "I am exactly where I need to be." 🙏\n\nWhat\'s yours?',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    likes: 923,
    comments: 234,
    shares: 89
  },
  {
    id: 'post_8',
    userId: 'user_5',
    type: POST_TYPES.IMAGE,
    content: 'Full moon energy tonight! Perfect time for manifestation rituals 🌕✨',
    imageUrl: SAMPLE_IMAGES[3],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    likes: 2345,
    comments: 178,
    shares: 456
  },
  {
    id: 'post_9',
    userId: 'user_3',
    type: POST_TYPES.TEXT,
    content: 'Hot take: Self-care isn\'t selfish, it\'s necessary. You can\'t pour from an empty cup. 🍵💜',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    likes: 3456,
    comments: 267,
    shares: 678
  },
  {
    id: 'post_10',
    userId: 'user_2',
    type: POST_TYPES.IMAGE,
    content: 'The stars aligned perfectly last night. Captured this from my rooftop 🌃',
    imageUrl: SAMPLE_IMAGES[4],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 1.5 days ago
    likes: 1876,
    comments: 98,
    shares: 234
  }
]

/**
 * Get post by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getPostById(id) {
  return MOCK_POSTS.find(p => p.id === id) || null
}

/**
 * Get posts by user ID
 * @param {string} userId
 * @returns {Array}
 */
export function getPostsByUserId(userId) {
  return MOCK_POSTS.filter(p => p.userId === userId)
}

/**
 * Get post with user data
 * @param {string} id
 * @returns {Object|null}
 */
export function getPostWithUser(id) {
  const post = getPostById(id)
  if (!post) return null
  
  const user = MOCK_USERS.find(u => u.id === post.userId)
  return { ...post, user }
}

/**
 * Get all posts with user data
 * @returns {Array}
 */
export function getAllPostsWithUsers() {
  return MOCK_POSTS.map(post => {
    const user = MOCK_USERS.find(u => u.id === post.userId)
    return { ...post, user }
  })
}

/**
 * Format relative time
 * @param {string} timestamp
 * @returns {string}
 */
export function formatRelativeTime(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
