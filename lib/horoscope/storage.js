// Storage layer for Horoscope feature
// Zodiac readings generator

const STORAGE_KEY = 'novatok_horoscope_history_dev'
const MAX_HISTORY = 10

const SIGNS = [
  { id: 'aries', name: 'Aries', symbol: '♈', dates: 'Mar 21 - Apr 19' },
  { id: 'taurus', name: 'Taurus', symbol: '♉', dates: 'Apr 20 - May 20' },
  { id: 'gemini', name: 'Gemini', symbol: '♊', dates: 'May 21 - Jun 20' },
  { id: 'cancer', name: 'Cancer', symbol: '♋', dates: 'Jun 21 - Jul 22' },
  { id: 'leo', name: 'Leo', symbol: '♌', dates: 'Jul 23 - Aug 22' },
  { id: 'virgo', name: 'Virgo', symbol: '♍', dates: 'Aug 23 - Sep 22' },
  { id: 'libra', name: 'Libra', symbol: '♎', dates: 'Sep 23 - Oct 22' },
  { id: 'scorpio', name: 'Scorpio', symbol: '♏', dates: 'Oct 23 - Nov 21' },
  { id: 'sagittarius', name: 'Sagittarius', symbol: '♐', dates: 'Nov 22 - Dec 21' },
  { id: 'capricorn', name: 'Capricorn', symbol: '♑', dates: 'Dec 22 - Jan 19' },
  { id: 'aquarius', name: 'Aquarius', symbol: '♒', dates: 'Jan 20 - Feb 18' },
  { id: 'pisces', name: 'Pisces', symbol: '♓', dates: 'Feb 19 - Mar 20' },
]

const LOVE_PHRASES = [
  'Romance is in the air today. Open your heart to unexpected connections.',
  'Your relationships deepen as honest communication flows naturally.',
  'A meaningful conversation could spark new feelings.',
  'Trust your intuition in matters of the heart.',
  'Old flames may resurface - reflect before acting.',
  'Self-love is your foundation today. Nurture yourself first.',
  'Partnership energy is strong - collaborate with those you cherish.',
  'Vulnerability becomes your strength in close relationships.',
]

const CAREER_PHRASES = [
  'Professional opportunities arise from unexpected quarters.',
  'Your leadership qualities shine through today.',
  'Focus on completing unfinished projects for maximum satisfaction.',
  'Networking opens doors you didn\'t know existed.',
  'Creative solutions come easily - trust your instincts.',
  'Financial matters require careful attention today.',
  'A mentor figure may offer valuable guidance.',
  'Your hard work is being noticed by the right people.',
]

const MOOD_PHRASES = [
  'Energy levels are high - channel it productively.',
  'Inner peace comes from accepting what you cannot change.',
  'Optimism carries you through any challenges today.',
  'Rest and reflection bring clarity to confused thoughts.',
  'Social connections lift your spirits immensely.',
  'Creative expression helps process complex emotions.',
  'Patience is your superpower today.',
  'Adventure calls - say yes to new experiences.',
]

const LUCKY_NUMBERS = ['3', '7', '11', '14', '21', '27', '33', '42', '56', '77', '88', '99']
const LUCKY_COLORS = ['Purple', 'Gold', 'Silver', 'Blue', 'Green', 'Red', 'White', 'Orange']

/**
 * Generate deterministic horoscope based on sign and date
 */
export function generateReading(signId, dateStr) {
  const sign = SIGNS.find(s => s.id === signId) || SIGNS[0]
  const date = new Date(dateStr)
  const seed = date.getDate() + date.getMonth() * 31 + SIGNS.indexOf(sign) * 12
  
  const love = LOVE_PHRASES[seed % LOVE_PHRASES.length]
  const career = CAREER_PHRASES[(seed + 3) % CAREER_PHRASES.length]
  const mood = MOOD_PHRASES[(seed + 7) % MOOD_PHRASES.length]
  const luckyNumber = LUCKY_NUMBERS[(seed + 2) % LUCKY_NUMBERS.length]
  const luckyColor = LUCKY_COLORS[(seed + 5) % LUCKY_COLORS.length]
  
  return {
    id: `${signId}_${dateStr}`,
    sign,
    date: dateStr,
    love,
    career,
    mood,
    luckyNumber,
    luckyColor,
    generatedAt: new Date().toISOString()
  }
}

/**
 * Save reading to history
 */
export async function saveReading(reading) {
  if (typeof window === 'undefined') return
  
  try {
    const history = getHistory()
    // Avoid duplicates
    const exists = history.find(r => r.id === reading.id)
    if (!exists) {
      history.unshift(reading)
      if (history.length > MAX_HISTORY) history.pop()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    }
  } catch (e) {
    console.error('Failed to save horoscope reading:', e)
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

export { SIGNS }
