// Storage layer for Tarot/AI Psychic feature
// Tarot card readings generator

const STORAGE_KEY = 'novatok_tarot_history_dev'
const MAX_HISTORY = 10

const TAROT_CARDS = [
  { name: 'The Fool', meaning: 'New beginnings, innocence, spontaneity, free spirit', reversed: 'Recklessness, risk-taking, holding back' },
  { name: 'The Magician', meaning: 'Manifestation, resourcefulness, power, inspired action', reversed: 'Manipulation, poor planning, untapped talents' },
  { name: 'The High Priestess', meaning: 'Intuition, sacred knowledge, divine feminine, subconscious', reversed: 'Secrets, disconnection from intuition, withdrawal' },
  { name: 'The Empress', meaning: 'Femininity, beauty, nature, nurturing, abundance', reversed: 'Creative block, dependence on others, emptiness' },
  { name: 'The Emperor', meaning: 'Authority, establishment, structure, father figure', reversed: 'Domination, excessive control, lack of discipline' },
  { name: 'The Hierophant', meaning: 'Spiritual wisdom, tradition, conformity, morality', reversed: 'Rebellion, subversiveness, new approaches' },
  { name: 'The Lovers', meaning: 'Love, harmony, relationships, values alignment', reversed: 'Self-love, disharmony, imbalance, misalignment' },
  { name: 'The Chariot', meaning: 'Control, willpower, success, action, determination', reversed: 'Self-discipline, opposition, lack of direction' },
  { name: 'Strength', meaning: 'Strength, courage, persuasion, influence, compassion', reversed: 'Inner strength, self-doubt, low energy' },
  { name: 'The Hermit', meaning: 'Soul-searching, introspection, inner guidance', reversed: 'Isolation, loneliness, withdrawal' },
  { name: 'Wheel of Fortune', meaning: 'Good luck, karma, life cycles, destiny, turning point', reversed: 'Bad luck, resistance to change, breaking cycles' },
  { name: 'Justice', meaning: 'Justice, fairness, truth, cause and effect, law', reversed: 'Unfairness, lack of accountability, dishonesty' },
  { name: 'The Hanged Man', meaning: 'Pause, surrender, letting go, new perspectives', reversed: 'Delays, resistance, stalling, indecision' },
  { name: 'Death', meaning: 'Endings, change, transformation, transition', reversed: 'Resistance to change, personal transformation' },
  { name: 'Temperance', meaning: 'Balance, moderation, patience, purpose', reversed: 'Imbalance, excess, self-healing, realignment' },
  { name: 'The Devil', meaning: 'Shadow self, attachment, addiction, restriction', reversed: 'Releasing limiting beliefs, exploring dark thoughts' },
  { name: 'The Tower', meaning: 'Sudden change, upheaval, chaos, revelation', reversed: 'Personal transformation, fear of change' },
  { name: 'The Star', meaning: 'Hope, faith, purpose, renewal, spirituality', reversed: 'Lack of faith, despair, self-trust issues' },
  { name: 'The Moon', meaning: 'Illusion, fear, anxiety, subconscious, intuition', reversed: 'Release of fear, repressed emotion, inner confusion' },
  { name: 'The Sun', meaning: 'Positivity, fun, warmth, success, vitality', reversed: 'Inner child, feeling down, overly optimistic' },
  { name: 'Judgement', meaning: 'Judgement, rebirth, inner calling, absolution', reversed: 'Self-doubt, inner critic, ignoring the call' },
  { name: 'The World', meaning: 'Completion, integration, accomplishment, travel', reversed: 'Seeking personal closure, short-cuts, delays' },
]

const INTERPRETATIONS = [
  'The cards suggest a time of {theme}. Trust in the process and remain open to {action}.',
  'This reading indicates {theme}. Consider how {action} might serve your highest good.',
  'The energy around your question points to {theme}. {action} will bring clarity.',
  'Your cards reveal {theme}. The universe encourages you to {action}.',
]

const THEMES = ['transformation', 'growth', 'reflection', 'action', 'patience', 'love', 'change', 'abundance']
const ACTIONS = ['letting go of what no longer serves you', 'embracing new opportunities', 'trusting your intuition', 'taking bold steps forward', 'finding balance', 'opening your heart']

/**
 * Simple hash function for string
 */
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * Generate deterministic tarot reading based on question and date
 */
export function generateReading(question, spread, dateStr) {
  const date = new Date(dateStr || new Date())
  const seed = hashString(question) + date.getDate() + date.getMonth() * 31
  
  const numCards = spread === '3-card' ? 3 : 1
  const cards = []
  const usedIndices = new Set()
  
  for (let i = 0; i < numCards; i++) {
    let cardIndex = (seed + i * 7) % TAROT_CARDS.length
    while (usedIndices.has(cardIndex)) {
      cardIndex = (cardIndex + 1) % TAROT_CARDS.length
    }
    usedIndices.add(cardIndex)
    
    const card = TAROT_CARDS[cardIndex]
    const isReversed = ((seed + i * 3) % 3) === 0
    
    let position = ''
    if (spread === '3-card') {
      position = ['Past', 'Present', 'Future'][i]
    }
    
    cards.push({
      ...card,
      isReversed,
      position,
      interpretation: isReversed ? card.reversed : card.meaning
    })
  }
  
  const theme = THEMES[seed % THEMES.length]
  const action = ACTIONS[(seed + 4) % ACTIONS.length]
  const template = INTERPRETATIONS[seed % INTERPRETATIONS.length]
  const overallInterpretation = template.replace('{theme}', theme).replace('{action}', action)
  
  return {
    id: `tarot_${seed}_${date.toDateString()}`,
    question,
    spread,
    cards,
    overallInterpretation,
    generatedAt: date.toISOString()
  }
}

/**
 * Save reading to history
 */
export async function saveReading(reading) {
  if (typeof window === 'undefined') return
  
  try {
    const history = getHistory()
    history.unshift(reading)
    if (history.length > MAX_HISTORY) history.pop()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('Failed to save tarot reading:', e)
  }
}

/**
 * Get history
 */
export function getHistory() {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

export const SPREAD_OPTIONS = [
  { id: '1-card', name: 'Single Card', description: 'Quick insight' },
  { id: '3-card', name: 'Past/Present/Future', description: 'Timeline spread' },
]
