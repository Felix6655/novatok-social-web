// Storage layer for Thinking feature
// Trivia/critical thinking questions

import { supabase, getCurrentUser } from '@/lib/supabase/client'
import { isDevelopment } from '@/lib/supabase/health'

const STORAGE_KEY = 'novatok_thinking_history_dev'
const MAX_HISTORY = 10

// Topics and their question banks
const TOPICS = {
  science: [
    { q: 'What is the primary function of mitochondria in cells?', a: ['Energy production', 'Protein synthesis', 'Cell division', 'Waste removal'], correct: 0, why: 'Understanding cellular energy is fundamental to biology and medicine.' },
    { q: 'Which planet has the strongest magnetic field?', a: ['Earth', 'Jupiter', 'Saturn', 'Mars'], correct: 1, why: 'Planetary magnetism affects space exploration and satellite operations.' },
    { q: 'What causes ocean tides?', a: ['Wind patterns', 'Earth rotation only', 'Moon and Sun gravity', 'Ocean currents'], correct: 2, why: 'Tidal knowledge is crucial for coastal communities and marine navigation.' },
  ],
  history: [
    { q: 'Which ancient civilization invented the first writing system?', a: ['Egyptian', 'Sumerian', 'Chinese', 'Greek'], correct: 1, why: 'Writing transformed human civilization and enabled knowledge preservation.' },
    { q: 'What year did the Berlin Wall fall?', a: ['1987', '1989', '1991', '1993'], correct: 1, why: 'This event marked the end of the Cold War division of Europe.' },
    { q: 'Who was the first female Nobel Prize winner?', a: ['Marie Curie', 'Mother Teresa', 'Rosalind Franklin', 'Dorothy Hodgkin'], correct: 0, why: 'Recognizing pioneers helps inspire future generations of scientists.' },
  ],
  politics: [
    { q: 'How many countries are permanent members of the UN Security Council?', a: ['3', '5', '7', '10'], correct: 1, why: 'Understanding global governance structures affects international relations.' },
    { q: 'What document established the European Union?', a: ['Treaty of Rome', 'Maastricht Treaty', 'Lisbon Treaty', 'Geneva Convention'], correct: 1, why: 'The EU represents the largest peaceful integration of nations in history.' },
    { q: 'Which country was first to grant women voting rights?', a: ['USA', 'UK', 'New Zealand', 'France'], correct: 2, why: 'Suffrage history reminds us that rights require persistent advocacy.' },
  ],
  health: [
    { q: 'What percentage of the human body is water?', a: ['40-50%', '50-60%', '60-70%', '70-80%'], correct: 2, why: 'Hydration is fundamental to every bodily function.' },
    { q: 'Which vitamin is produced when skin is exposed to sunlight?', a: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'], correct: 2, why: 'Vitamin D deficiency affects millions and impacts bone and immune health.' },
    { q: 'How many hours of sleep do most adults need?', a: ['4-5 hours', '5-6 hours', '7-9 hours', '10-12 hours'], correct: 2, why: 'Sleep quality directly impacts cognitive function and long-term health.' },
  ],
  tech: [
    { q: 'What does CPU stand for?', a: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Utility', 'Core Processing Unit'], correct: 0, why: 'Understanding computer basics is essential in our digital world.' },
    { q: 'Who is credited with inventing the World Wide Web?', a: ['Bill Gates', 'Steve Jobs', 'Tim Berners-Lee', 'Vint Cerf'], correct: 2, why: 'The web democratized information access globally.' },
    { q: 'What year was the first iPhone released?', a: ['2005', '2007', '2009', '2010'], correct: 1, why: 'Smartphones revolutionized how we communicate and access information.' },
  ],
  space: [
    { q: 'How long does light from the Sun take to reach Earth?', a: ['1 minute', '8 minutes', '1 hour', '1 day'], correct: 1, why: 'Understanding cosmic distances puts our place in the universe in perspective.' },
    { q: 'What is the largest planet in our solar system?', a: ['Saturn', 'Jupiter', 'Neptune', 'Uranus'], correct: 1, why: 'Planetary science helps us understand Earth\'s formation and future.' },
    { q: 'How many moons does Mars have?', a: ['0', '1', '2', '4'], correct: 2, why: 'Mars exploration is humanity\'s next frontier in space.' },
  ],
  sports: [
    { q: 'How many players are on a standard soccer team on the field?', a: ['9', '10', '11', '12'], correct: 2, why: 'Soccer is the world\'s most popular sport, connecting billions.' },
    { q: 'In which year were the first modern Olympics held?', a: ['1896', '1900', '1904', '1912'], correct: 0, why: 'The Olympics represent global unity through athletic competition.' },
    { q: 'What is the maximum score in a single frame of bowling?', a: ['20', '25', '30', '35'], correct: 2, why: 'Understanding scoring systems enhances sports appreciation.' },
  ],
}

const DIFFICULTY_MULTIPLIER = { easy: 0, medium: 1, hard: 2 }

/**
 * Generate a deterministic question based on topic, difficulty, and date
 */
export function generateQuestion(topic, difficulty) {
  const questions = TOPICS[topic] || TOPICS.science
  const date = new Date()
  const seed = date.getDate() + date.getMonth() * 31 + DIFFICULTY_MULTIPLIER[difficulty]
  const index = seed % questions.length
  const question = questions[index]
  
  // Shuffle answers deterministically
  const shuffledAnswers = [...question.a]
  const correctAnswer = shuffledAnswers[question.correct]
  
  // Simple deterministic shuffle
  for (let i = shuffledAnswers.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1)
    ;[shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]]
  }
  
  const newCorrectIndex = shuffledAnswers.indexOf(correctAnswer)
  
  return {
    id: `${topic}_${difficulty}_${date.toDateString()}`,
    topic,
    difficulty,
    question: question.q,
    answers: shuffledAnswers,
    correctIndex: newCorrectIndex,
    explanation: `The correct answer is "${correctAnswer}".`,
    whyItMatters: question.why,
    generatedAt: date.toISOString()
  }
}

/**
 * Save session to history
 */
export async function saveSession(session) {
  if (typeof window === 'undefined') return
  
  try {
    const history = getHistory()
    history.unshift(session)
    if (history.length > MAX_HISTORY) history.pop()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch (e) {
    console.error('Failed to save thinking session:', e)
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

export const TOPIC_LIST = Object.keys(TOPICS)
export const DIFFICULTY_LIST = ['easy', 'medium', 'hard']
