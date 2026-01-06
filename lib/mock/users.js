// Mock users data for Social Feed

export const MOCK_USERS = [
  {
    id: 'user_1',
    username: 'stargazer',
    displayName: 'Luna ✨',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
    bio: 'Exploring the universe one thought at a time 🌙',
    verified: true,
    stats: {
      posts: 142,
      followers: 12400,
      following: 234,
      likes: 45600
    },
    joinedAt: '2024-01-15'
  },
  {
    id: 'user_2',
    username: 'cosmic_dreamer',
    displayName: 'Alex Nova',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Digital artist & tarot enthusiast 🎨',
    verified: false,
    stats: {
      posts: 87,
      followers: 5600,
      following: 412,
      likes: 23100
    },
    joinedAt: '2024-02-20'
  },
  {
    id: 'user_3',
    username: 'mindful_maya',
    displayName: 'Maya Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
    bio: 'Mindfulness coach | Spreading positivity 🧘‍♀️',
    verified: true,
    stats: {
      posts: 256,
      followers: 34200,
      following: 128,
      likes: 89300
    },
    joinedAt: '2023-11-10'
  },
  {
    id: 'user_4',
    username: 'techsoul',
    displayName: 'Jordan Lee',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
    bio: 'Tech meets spirituality 💻✨',
    verified: false,
    stats: {
      posts: 64,
      followers: 2100,
      following: 567,
      likes: 8900
    },
    joinedAt: '2024-03-05'
  },
  {
    id: 'user_5',
    username: 'astro_alice',
    displayName: 'Alice Moon',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    bio: 'Astrologer | Your stars have stories 🌟',
    verified: true,
    stats: {
      posts: 312,
      followers: 67800,
      following: 89,
      likes: 156000
    },
    joinedAt: '2023-08-22'
  },
  {
    id: 'user_6',
    username: 'vibes_only',
    displayName: 'Kai Vibes',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai',
    bio: 'Good vibes and late nights 🌃',
    verified: false,
    stats: {
      posts: 98,
      followers: 4500,
      following: 312,
      likes: 15600
    },
    joinedAt: '2024-01-28'
  },
  {
    id: 'user_demo',
    username: 'you',
    displayName: 'You',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
    bio: 'This is your profile 🎭',
    verified: false,
    stats: {
      posts: 12,
      followers: 156,
      following: 89,
      likes: 420
    },
    joinedAt: '2024-06-01'
  }
]

/**
 * Get user by username
 * @param {string} username
 * @returns {Object|null}
 */
export function getUserByUsername(username) {
  return MOCK_USERS.find(u => u.username === username) || null
}

/**
 * Get user by ID
 * @param {string} id
 * @returns {Object|null}
 */
export function getUserById(id) {
  return MOCK_USERS.find(u => u.id === id) || null
}

/**
 * Get demo user
 * @returns {Object}
 */
export function getDemoUser() {
  return MOCK_USERS.find(u => u.id === 'user_demo')
}

/**
 * Format follower count
 * @param {number} count
 * @returns {string}
 */
export function formatCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`
  return count.toString()
}
