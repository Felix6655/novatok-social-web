// NovaTok Music - Token Rewards System
// Tracks listening time and awards tokens

const REWARDS_KEY = 'novatok_music_rewards'
const LISTENING_SESSION_KEY = 'novatok_music_session'

// Reward configuration
export const REWARD_CONFIG = {
  tokensPerMinute: 1,           // Base tokens per minute
  milestones: [
    { minutes: 5, bonus: 5 },     // 5 bonus tokens at 5 mins
    { minutes: 15, bonus: 15 },   // 15 bonus at 15 mins
    { minutes: 30, bonus: 30 },   // 30 bonus at 30 mins
    { minutes: 60, bonus: 100 },  // 100 bonus at 1 hour
    { minutes: 120, bonus: 250 }, // 250 bonus at 2 hours
  ],
  minVolumeForReward: 0.1,      // Must have 10% volume
  updateIntervalSeconds: 10,    // Check every 10 seconds
}

/**
 * Get current rewards state
 */
export function getRewardsState() {
  if (typeof window === 'undefined') return getDefaultState()
  
  try {
    const stored = localStorage.getItem(REWARDS_KEY)
    if (stored) {
      const state = JSON.parse(stored)
      return {
        ...getDefaultState(),
        ...state,
        claimedMilestones: state.claimedMilestones || [],
      }
    }
  } catch (e) {
    console.warn('Failed to load rewards state:', e)
  }
  
  return getDefaultState()
}

function getDefaultState() {
  return {
    totalTokens: 0,
    totalMinutesListened: 0,
    todayMinutesListened: 0,
    todayTokensEarned: 0,
    lastListenDate: null,
    claimedMilestones: [],
    lifetimeMinutes: 0,
  }
}

/**
 * Save rewards state
 */
export function saveRewardsState(state) {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(REWARDS_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save rewards state:', e)
  }
}

/**
 * Get current listening session
 */
export function getListeningSession() {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem(LISTENING_SESSION_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

/**
 * Start a listening session
 */
export function startListeningSession(trackId) {
  if (typeof window === 'undefined') return
  
  const session = {
    trackId,
    startTime: Date.now(),
    lastUpdateTime: Date.now(),
    accumulatedSeconds: 0,
    isActive: true,
  }
  
  try {
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
  } catch (e) {
    console.warn('Failed to start session:', e)
  }
  
  return session
}

/**
 * Update listening session and calculate rewards
 * @param {boolean} isPlaying - Is music currently playing
 * @param {number} volume - Current volume (0-1)
 * @param {boolean} isTabActive - Is the browser tab active
 * @returns {object} Updated state with new tokens if any
 */
export function updateListeningSession(isPlaying, volume, isTabActive) {
  if (typeof window === 'undefined') return { tokensEarned: 0 }
  
  const session = getListeningSession()
  if (!session || !session.isActive) return { tokensEarned: 0 }
  
  // Check abuse prevention
  if (!isPlaying || volume < REWARD_CONFIG.minVolumeForReward || !isTabActive) {
    // Update last time but don't accumulate
    session.lastUpdateTime = Date.now()
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
    return { tokensEarned: 0, reason: 'inactive' }
  }
  
  const now = Date.now()
  const elapsedSeconds = Math.floor((now - session.lastUpdateTime) / 1000)
  
  // Only update if at least 1 second passed
  if (elapsedSeconds < 1) return { tokensEarned: 0 }
  
  // Update session
  session.accumulatedSeconds += elapsedSeconds
  session.lastUpdateTime = now
  
  try {
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
  } catch (e) {
    console.warn('Failed to update session:', e)
  }
  
  // Calculate rewards
  const state = getRewardsState()
  const today = new Date().toDateString()
  
  // Reset daily counters if new day
  if (state.lastListenDate !== today) {
    state.todayMinutesListened = 0
    state.todayTokensEarned = 0
    state.lastListenDate = today
  }
  
  // Calculate minutes (rounded down to nearest minute)
  const totalMinutes = Math.floor(session.accumulatedSeconds / 60)
  const previousMinutes = Math.floor((session.accumulatedSeconds - elapsedSeconds) / 60)
  const newMinutes = totalMinutes - previousMinutes
  
  let tokensEarned = 0
  
  // Award tokens for new minutes
  if (newMinutes > 0) {
    tokensEarned += newMinutes * REWARD_CONFIG.tokensPerMinute
    state.totalMinutesListened += newMinutes
    state.todayMinutesListened += newMinutes
    state.lifetimeMinutes += newMinutes
  }
  
  // Check milestones
  let milestoneBonuses = []
  for (const milestone of REWARD_CONFIG.milestones) {
    const milestoneKey = `${today}-${milestone.minutes}`
    if (
      state.todayMinutesListened >= milestone.minutes && 
      !state.claimedMilestones.includes(milestoneKey)
    ) {
      tokensEarned += milestone.bonus
      state.claimedMilestones.push(milestoneKey)
      milestoneBonuses.push({ minutes: milestone.minutes, bonus: milestone.bonus })
    }
  }
  
  // Update totals
  if (tokensEarned > 0) {
    state.totalTokens += tokensEarned
    state.todayTokensEarned += tokensEarned
    saveRewardsState(state)
  }
  
  return {
    tokensEarned,
    totalTokens: state.totalTokens,
    todayMinutes: state.todayMinutesListened,
    todayTokens: state.todayTokensEarned,
    milestones: milestoneBonuses,
    lifetimeMinutes: state.lifetimeMinutes,
  }
}

/**
 * End listening session
 */
export function endListeningSession() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(LISTENING_SESSION_KEY)
  } catch (e) {
    console.warn('Failed to end session:', e)
  }
}

/**
 * Format token amount
 */
export function formatTokens(amount) {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
  return amount.toString()
}

/**
 * Get progress to next milestone
 */
export function getNextMilestone(currentMinutes) {
  const today = new Date().toDateString()
  const state = getRewardsState()
  
  for (const milestone of REWARD_CONFIG.milestones) {
    const milestoneKey = `${today}-${milestone.minutes}`
    if (!state.claimedMilestones.includes(milestoneKey) && currentMinutes < milestone.minutes) {
      return {
        target: milestone.minutes,
        bonus: milestone.bonus,
        progress: currentMinutes / milestone.minutes,
        remaining: milestone.minutes - currentMinutes,
      }
    }
  }
  
  return null // All milestones claimed
}
