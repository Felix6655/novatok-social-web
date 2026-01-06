// Memories aggregation layer
// Normalizes data from Think, Tarot, and Horoscope into a unified timeline

import { getThoughts } from '@/lib/think/storage'
import { getHistory as getTarotHistory } from '@/lib/tarot/storage'
import { getHistory as getHoroscopeHistory } from '@/lib/horoscope/storage'

/**
 * Memory item types
 */
export const MEMORY_TYPES = {
  THINK: 'think',
  TAROT: 'tarot',
  HOROSCOPE: 'horoscope'
}

/**
 * Mood display labels
 */
const MOOD_LABELS = {
  release: 'Released',
  vent: 'Vented',
  reflect: 'Reflected',
  hopeful: 'Hopeful',
  neutral: 'Thought'
}

/**
 * Normalize a thought into a memory item
 */
function normalizeThought(thought) {
  const moodLabel = MOOD_LABELS[thought.mood] || 'Thought'
  
  return {
    id: thought.id,
    type: MEMORY_TYPES.THINK,
    title: `${moodLabel} moment`,
    summary: thought.text.length > 150 
      ? thought.text.substring(0, 147) + '...' 
      : thought.text,
    metadata: {
      mood: thought.mood,
      fullText: thought.text
    },
    createdAt: thought.created_at
  }
}

/**
 * Normalize a tarot reading into a memory item
 */
function normalizeTarot(reading) {
  const cardNames = reading.cards.map(c => c.name).join(', ')
  const spreadLabel = reading.spread === '3-card' ? 'Past/Present/Future' : 'Single Card'
  
  return {
    id: reading.id,
    type: MEMORY_TYPES.TAROT,
    title: `Tarot Reading: ${spreadLabel}`,
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
    createdAt: reading.generatedAt
  }
}

/**
 * Normalize a horoscope reading into a memory item
 */
function normalizeHoroscope(reading) {
  const sign = reading.sign
  
  return {
    id: reading.id,
    type: MEMORY_TYPES.HOROSCOPE,
    title: `${sign.name} ${sign.symbol} Daily Reading`,
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
    createdAt: reading.generatedAt
  }
}

/**
 * Group memories by date category
 */
export function groupMemoriesByDate(memories) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const thisWeekStart = new Date(today)
  thisWeekStart.setDate(thisWeekStart.getDate() - 7)

  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  }

  memories.forEach(memory => {
    const memoryDate = new Date(memory.createdAt)
    const memoryDay = new Date(memoryDate.getFullYear(), memoryDate.getMonth(), memoryDate.getDate())

    if (memoryDay.getTime() === today.getTime()) {
      groups.today.push(memory)
    } else if (memoryDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(memory)
    } else if (memoryDay >= thisWeekStart) {
      groups.thisWeek.push(memory)
    } else {
      groups.older.push(memory)
    }
  })

  return groups
}

/**
 * Fetch and aggregate all memories from all sources
 * @returns {Promise<Array>} Normalized and sorted memory items
 */
export async function getAggregatedMemories() {
  const memories = []

  try {
    // Fetch thoughts
    const thoughts = await getThoughts()
    thoughts.forEach(thought => {
      try {
        memories.push(normalizeThought(thought))
      } catch (e) {
        console.error('Failed to normalize thought:', e)
      }
    })
  } catch (e) {
    console.error('Failed to fetch thoughts:', e)
  }

  try {
    // Fetch tarot readings
    const tarotReadings = getTarotHistory()
    tarotReadings.forEach(reading => {
      try {
        memories.push(normalizeTarot(reading))
      } catch (e) {
        console.error('Failed to normalize tarot:', e)
      }
    })
  } catch (e) {
    console.error('Failed to fetch tarot history:', e)
  }

  try {
    // Fetch horoscope readings
    const horoscopeReadings = getHoroscopeHistory()
    horoscopeReadings.forEach(reading => {
      try {
        memories.push(normalizeHoroscope(reading))
      } catch (e) {
        console.error('Failed to normalize horoscope:', e)
      }
    })
  } catch (e) {
    console.error('Failed to fetch horoscope history:', e)
  }

  // Sort by createdAt descending (most recent first)
  memories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return memories
}

/**
 * Format a date for display
 */
export function formatMemoryDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}
