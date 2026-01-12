/**
 * SoulMatch V1 Service Layer
 * 
 * Handles profile management, candidate generation, matching, and messaging.
 * Uses storage adapter for cross-platform compatibility.
 */

import storage from './storage'

// Storage keys
const PROFILE_KEY = 'soulmatch_profile'
const CANDIDATES_KEY = 'soulmatch_candidates'
const SWIPES_KEY = 'soulmatch_swipes'
const MATCHES_KEY = 'soulmatch_matches'
const MESSAGES_PREFIX = 'soulmatch_messages_'

// Constants
const NUM_CANDIDATES = 40
const MAX_MATCHES = 50
const MAX_MESSAGES = 100

// Available interests for multi-select
export const AVAILABLE_INTERESTS = [
  'Music', 'Movies', 'Travel', 'Fitness', 'Reading', 'Gaming',
  'Cooking', 'Photography', 'Art', 'Technology', 'Sports', 'Nature',
  'Fashion', 'Dancing', 'Yoga', 'Pets', 'Coffee', 'Wine',
  'Hiking', 'Beach', 'Concerts', 'Theatre', 'Writing', 'Podcasts'
]

// Looking for options
export const LOOKING_FOR_OPTIONS = [
  { id: 'friendship', label: 'Friendship' },
  { id: 'dating', label: 'Dating' },
  { id: 'networking', label: 'Networking' }
]

// ==========================================
// Profile Management
// ==========================================

/**
 * Get user's SoulMatch profile
 * @returns {Promise<Object|null>}
 */
export async function getProfile() {
  return storage.getItem(PROFILE_KEY, null)
}

/**
 * Save user's SoulMatch profile
 * @param {Object} profile - { displayName, bio, ageRange, interests, location, lookingFor }
 */
export async function saveProfile(profile) {
  const validated = {
    displayName: (profile.displayName || '').trim().slice(0, 50),
    bio: (profile.bio || '').trim().slice(0, 200),
    ageRange: {
      min: Math.max(18, Math.min(99, profile.ageRange?.min || 18)),
      max: Math.max(18, Math.min(99, profile.ageRange?.max || 50))
    },
    interests: (profile.interests || []).slice(0, 10),
    location: (profile.location || '').trim().slice(0, 100),
    lookingFor: LOOKING_FOR_OPTIONS.some(o => o.id === profile.lookingFor) 
      ? profile.lookingFor 
      : 'friendship',
    createdAt: profile.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  await storage.setItem(PROFILE_KEY, validated)
  return validated
}

/**
 * Clear user's profile
 */
export async function clearProfile() {
  await storage.removeItem(PROFILE_KEY)
}

// ==========================================
// Candidate Pool Generation
// ==========================================

// Seeded random number generator for deterministic results
function seededRandom(seed) {
  let s = seed
  return function() {
    s = Math.sin(s) * 10000
    return s - Math.floor(s)
  }
}

// Names for generating candidates
const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Luna', 'Michael',
  'Camila', 'Daniel', 'Aria', 'Jacob', 'Scarlett', 'Logan', 'Victoria',
  'Sebastian', 'Maya', 'Jack', 'Chloe', 'Owen', 'Penelope', 'Ryan',
  'Layla', 'Nathan', 'Riley', 'Caleb', 'Zoey', 'Isaac', 'Nora', 'Dylan'
]

const BIOS = [
  'Adventure seeker and coffee enthusiast ☕',
  'Just looking for good vibes and great conversations',
  'Music lover | Travel addict | Dog parent 🐕',
  'Here to meet interesting people!',
  'Foodie who loves trying new restaurants',
  'Bookworm by day, Netflix binger by night 📚',
  'Gym rat and health enthusiast 💪',
  'Creative soul with a passion for art',
  'Tech nerd who also loves the outdoors',
  'Wine lover seeking adventure partners',
  'Photographer capturing life\'s moments 📷',
  'Hiking trails and coffee shops are my thing',
  'Living life one day at a time',
  'Passionate about making connections',
  'Love good food, good music, good people'
]

const LOCATIONS = [
  'New York', 'Los Angeles', 'Chicago', 'Miami', 'Austin',
  'Seattle', 'Denver', 'San Francisco', 'Boston', 'Portland',
  'Atlanta', 'Nashville', 'San Diego', 'Phoenix', 'Dallas'
]

const AVATAR_COLORS = [
  'bg-pink-500', 'bg-purple-500', 'bg-indigo-500', 'bg-blue-500',
  'bg-cyan-500', 'bg-teal-500', 'bg-green-500', 'bg-lime-500',
  'bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-rose-500'
]

const EMOJIS = ['😊', '🌟', '✨', '🎵', '📚', '🎨', '🌸', '🌈', '💫', '🦋', '🌺', '🍀']

/**
 * Generate candidate pool
 * @param {number} seed - Seed for deterministic generation
 * @returns {Array} Array of candidate profiles
 */
function generateCandidates(seed = 12345) {
  const rand = seededRandom(seed)
  const candidates = []
  
  for (let i = 0; i < NUM_CANDIDATES; i++) {
    const nameIndex = Math.floor(rand() * FIRST_NAMES.length)
    const bioIndex = Math.floor(rand() * BIOS.length)
    const locationIndex = Math.floor(rand() * LOCATIONS.length)
    const colorIndex = Math.floor(rand() * AVATAR_COLORS.length)
    const emojiIndex = Math.floor(rand() * EMOJIS.length)
    
    // Generate 3-6 random interests
    const numInterests = 3 + Math.floor(rand() * 4)
    const shuffledInterests = [...AVAILABLE_INTERESTS].sort(() => rand() - 0.5)
    const interests = shuffledInterests.slice(0, numInterests)
    
    // Some candidates "like" the user (for matching)
    const likesYou = rand() < 0.35 // 35% chance
    
    candidates.push({
      id: `candidate_${i + 1}`,
      name: FIRST_NAMES[nameIndex],
      bio: BIOS[bioIndex],
      age: 18 + Math.floor(rand() * 30), // 18-47
      location: LOCATIONS[locationIndex],
      interests,
      avatarColor: AVATAR_COLORS[colorIndex],
      emoji: EMOJIS[emojiIndex],
      likesYou,
      lookingFor: LOOKING_FOR_OPTIONS[Math.floor(rand() * LOOKING_FOR_OPTIONS.length)].id
    })
  }
  
  return candidates
}

/**
 * Load or generate candidates
 * @param {boolean} forceRegenerate - Force regeneration
 */
export async function loadCandidates(forceRegenerate = false) {
  if (!forceRegenerate) {
    const existing = await storage.getItem(CANDIDATES_KEY, null)
    if (existing && Array.isArray(existing) && existing.length > 0) {
      return existing
    }
  }
  
  // Generate new candidates with timestamp-based seed for variety on regenerate
  const seed = forceRegenerate ? Date.now() : 12345
  const candidates = generateCandidates(seed)
  await storage.setItem(CANDIDATES_KEY, candidates)
  return candidates
}

/**
 * Get candidates not yet swiped
 */
export async function getUnswipedCandidates() {
  const candidates = await loadCandidates()
  const swipes = await getSwipes()
  const swipedIds = new Set(swipes.map(s => s.candidateId))
  return candidates.filter(c => !swipedIds.has(c.id))
}

/**
 * Refresh candidate pool (regenerate)
 */
export async function refreshCandidates() {
  // Clear swipes when refreshing
  await storage.setItem(SWIPES_KEY, [])
  return loadCandidates(true)
}

// ==========================================
// Swipes & Matching
// ==========================================

/**
 * Get all swipes
 */
export async function getSwipes() {
  return storage.getItem(SWIPES_KEY, [])
}

/**
 * Record a swipe
 * @param {string} candidateId
 * @param {'like'|'pass'|'superlike'} action
 * @returns {Promise<{ isMatch: boolean, match?: Object }>}
 */
export async function recordSwipe(candidateId, action) {
  const swipes = await getSwipes()
  
  // Don't duplicate swipes
  if (swipes.some(s => s.candidateId === candidateId)) {
    return { isMatch: false }
  }
  
  swipes.push({
    candidateId,
    action,
    timestamp: new Date().toISOString()
  })
  await storage.setItem(SWIPES_KEY, swipes)
  
  // Check for match if liked or superliked
  if (action === 'like' || action === 'superlike') {
    const candidates = await loadCandidates()
    const candidate = candidates.find(c => c.id === candidateId)
    
    if (candidate && candidate.likesYou) {
      // It's a match!
      const match = await createMatch(candidate)
      return { isMatch: true, match }
    }
  }
  
  return { isMatch: false }
}

/**
 * Create a match
 */
async function createMatch(candidate) {
  const matches = await getMatches()
  
  // Don't duplicate matches
  if (matches.some(m => m.candidateId === candidate.id)) {
    return matches.find(m => m.candidateId === candidate.id)
  }
  
  const match = {
    id: `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    candidateId: candidate.id,
    candidateName: candidate.name,
    candidateEmoji: candidate.emoji,
    candidateColor: candidate.avatarColor,
    candidateBio: candidate.bio,
    matchedAt: new Date().toISOString()
  }
  
  const updated = [match, ...matches].slice(0, MAX_MATCHES)
  await storage.setItem(MATCHES_KEY, updated)
  
  return match
}

/**
 * Get all matches
 */
export async function getMatches() {
  return storage.getItem(MATCHES_KEY, [])
}

/**
 * Delete a match
 */
export async function deleteMatch(matchId) {
  const matches = await getMatches()
  const filtered = matches.filter(m => m.id !== matchId)
  await storage.setItem(MATCHES_KEY, filtered)
  
  // Also delete messages
  await storage.removeItem(`${MESSAGES_PREFIX}${matchId}`)
}

// ==========================================
// Messaging
// ==========================================

/**
 * Get messages for a match
 */
export async function getMessages(matchId) {
  return storage.getItem(`${MESSAGES_PREFIX}${matchId}`, [])
}

/**
 * Send a message
 */
export async function sendMessage(matchId, content) {
  const messages = await getMessages(matchId)
  
  const message = {
    id: `msg_${Date.now()}`,
    content: content.trim().slice(0, 500),
    sender: 'user',
    timestamp: new Date().toISOString()
  }
  
  const updated = [...messages, message].slice(-MAX_MESSAGES)
  await storage.setItem(`${MESSAGES_PREFIX}${matchId}`, updated)
  
  // Simulate reply after a delay (30% chance)
  if (Math.random() < 0.3) {
    setTimeout(async () => {
      const replies = [
        'Hey! Nice to hear from you 😊',
        'Thanks for the message!',
        'How\'s your day going?',
        'That\'s awesome!',
        'Would love to chat more!'
      ]
      const replyContent = replies[Math.floor(Math.random() * replies.length)]
      const currentMessages = await getMessages(matchId)
      const reply = {
        id: `msg_${Date.now()}`,
        content: replyContent,
        sender: 'match',
        timestamp: new Date().toISOString()
      }
      await storage.setItem(`${MESSAGES_PREFIX}${matchId}`, [...currentMessages, reply].slice(-MAX_MESSAGES))
    }, 2000 + Math.random() * 3000)
  }
  
  return message
}

// ==========================================
// Stats & Reset
// ==========================================

/**
 * Get swipe stats
 */
export async function getStats() {
  const swipes = await getSwipes()
  const matches = await getMatches()
  
  return {
    likes: swipes.filter(s => s.action === 'like').length,
    passes: swipes.filter(s => s.action === 'pass').length,
    superlikes: swipes.filter(s => s.action === 'superlike').length,
    matches: matches.length
  }
}

/**
 * Reset all SoulMatch data
 */
export async function resetAllData() {
  await storage.removeItem(PROFILE_KEY)
  await storage.removeItem(CANDIDATES_KEY)
  await storage.removeItem(SWIPES_KEY)
  await storage.removeItem(MATCHES_KEY)
  // Note: Individual message keys are not cleared here to avoid iterating all storage
}
