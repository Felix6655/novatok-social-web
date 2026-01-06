// Feed aggregation layer
// Combines content from Think, Tarot, Horoscope, and Thinking into a unified feed

import { getThoughts } from '@/lib/think/storage'
import { getHistory as getTarotHistory } from '@/lib/tarot/storage'
import { getHistory as getHoroscopeHistory } from '@/lib/horoscope/storage'
import { getHistory as getThinkingHistory } from '@/lib/thinking/storage'

/**
 * Feed item types
 */
export const FEED_TYPES = {
  THINK: 'think',
  TAROT: 'tarot',
  HOROSCOPE: 'horoscope',
  THINKING: 'thinking'
}

/**
 * Mood labels for thoughts
 */
const MOOD_LABELS = {
  release: 'Released',
  vent: 'Vented',
  reflect: 'Reflected',
  hopeful: 'Hopeful',
  neutral: 'Thought'
}

/**
 * Topic labels for thinking
 */
const TOPIC_LABELS = {
  science: 'Science',
  history: 'History',
  politics: 'Politics',
  health: 'Health',
  tech: 'Technology',
  space: 'Space',
  sports: 'Sports'
}

/**
 * Normalize a thought into a feed item
 */
function normalizeThought(thought) {
  const moodLabel = MOOD_LABELS[thought.mood] || 'Thought'
  
  return {
    id: thought.id,
    type: FEED_TYPES.THINK,
    title: `${moodLabel} moment`,
    summary: thought.text.length > 150 
      ? thought.text.substring(0, 147) + '...' 
      : thought.text,
    metadata: {
      mood: thought.mood,
      fullText: thought.text
    },
    createdAt: thought.created_at,
    linkTo: '/think'
  }
}

/**
 * Normalize a tarot reading into a feed item
 */
function normalizeTarot(reading) {
  const cardNames = reading.cards.map(c => c.name).join(', ')
  const spreadLabel = reading.spread === '3-card' ? 'Past/Present/Future' : 'Single Card'
  
  return {
    id: reading.id,
    type: FEED_TYPES.TAROT,
    title: `Tarot: ${spreadLabel}`,
    summary: reading.question.length > 100 
      ? reading.question.substring(0, 97) + '...'
      : reading.question,
    metadata: {
      question: reading.question,
      cards: reading.cards,
      cardNames,
      spread: reading.spread,
      overallInterpretation: reading.overallInterpretation
    },
    createdAt: reading.generatedAt,
    linkTo: '/tarot'
  }
}

/**
 * Normalize a horoscope reading into a feed item
 */
function normalizeHoroscope(reading) {
  const sign = reading.sign
  
  return {
    id: reading.id,
    type: FEED_TYPES.HOROSCOPE,
    title: `${sign.name} ${sign.symbol} Horoscope`,
    summary: reading.mood,
    metadata: {
      sign,
      date: reading.date,
      love: reading.love,
      career: reading.career,
      mood: reading.mood,
      luckyNumber: reading.luckyNumber,
      luckyColor: reading.luckyColor
    },
    createdAt: reading.generatedAt,
    linkTo: '/horoscope'
  }
}

/**
 * Normalize a thinking session into a feed item
 */
function normalizeThinking(session) {
  const topicLabel = TOPIC_LABELS[session.topic] || session.topic
  const isCorrect = session.isCorrect
  
  return {
    id: session.id,
    type: FEED_TYPES.THINKING,
    title: `${topicLabel} Challenge`,
    summary: session.question.length > 100 
      ? session.question.substring(0, 97) + '...'
      : session.question,
    metadata: {
      topic: session.topic,
      difficulty: session.difficulty,
      question: session.question,
      isCorrect,
      selectedAnswer: session.selectedAnswer,
      correctAnswer: session.correctAnswer,
      explanation: session.explanation
    },
    createdAt: session.answeredAt || session.generatedAt,
    linkTo: '/thinking'
  }
}

/**
 * Fetch and aggregate feed items from all sources
 * @param {number} limit - Maximum number of items to return
 * @returns {Promise<Array>} Normalized and sorted feed items
 */
export async function getFeedItems(limit = 20) {
  const feedItems = []

  // Fetch thoughts
  try {
    const thoughts = await getThoughts()
    thoughts.forEach(thought => {
      try {
        feedItems.push(normalizeThought(thought))
      } catch (e) {
        console.error('Failed to normalize thought:', e)
      }
    })
  } catch (e) {
    console.error('Failed to fetch thoughts:', e)
  }

  // Fetch tarot readings
  try {
    const tarotReadings = getTarotHistory()
    tarotReadings.forEach(reading => {
      try {
        feedItems.push(normalizeTarot(reading))
      } catch (e) {
        console.error('Failed to normalize tarot:', e)
      }
    })
  } catch (e) {
    console.error('Failed to fetch tarot history:', e)
  }

  // Fetch horoscope readings
  try {
    const horoscopeReadings = getHoroscopeHistory()
    horoscopeReadings.forEach(reading => {
      try {
        feedItems.push(normalizeHoroscope(reading))
      } catch (e) {
        console.error('Failed to normalize horoscope:', e)
      }
    })
  } catch (e) {
    console.error('Failed to fetch horoscope history:', e)
  }

  // Fetch thinking sessions
  try {
    const thinkingSessions = getThinkingHistory()
    thinkingSessions.forEach(session => {
      try {
        feedItems.push(normalizeThinking(session))
      } catch (e) {
        console.error('Failed to normalize thinking:', e)
      }
    })
  } catch (e) {
    console.error('Failed to fetch thinking history:', e)
  }

  // Sort by createdAt descending (most recent first)
  feedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // Return limited results
  return feedItems.slice(0, limit)
}

/**
 * Format a date for feed display
 */
export function formatFeedDate(dateString) {
  const date = new Date(dateString)
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

/**
 * Get feed item counts by type
 */
export async function getFeedCounts() {
  const items = await getFeedItems(100)
  return {
    total: items.length,
    think: items.filter(i => i.type === FEED_TYPES.THINK).length,
    tarot: items.filter(i => i.type === FEED_TYPES.TAROT).length,
    horoscope: items.filter(i => i.type === FEED_TYPES.HOROSCOPE).length,
    thinking: items.filter(i => i.type === FEED_TYPES.THINKING).length
  }
}
