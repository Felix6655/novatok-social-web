// NovaTok Music - Token Rewards System
// Anti-abuse measures with sensible caps

const REWARDS_KEY = 'novatok_music_rewards'
const LISTENING_SESSION_KEY = 'novatok_music_session'
const REWARD_HISTORY_KEY = 'novatok_music_reward_history'

// Reward configuration with anti-abuse
export const REWARD_CONFIG = {
  tokensPerMinute: 1,           // 1 token per minute of active listening
  songCompletionBonus: 5,       // +5 tokens per song (if ≥80% listened)
  songCompletionThreshold: 0.8, // Must listen to 80% of song
  dailyCap: 300,                // Max 300 tokens per day
  minVolumeForReward: 0.01,     // Volume must be > 0 (not muted)
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
      // Reset daily counters if new day
      const today = new Date().toDateString()
      if (state.lastListenDate !== today) {
        state.todayTokensEarned = 0
        state.todayMinutesListened = 0
        state.lastListenDate = today
        saveRewardsState(state)
      }
      return {
        ...getDefaultState(),
        ...state,
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
    lastListenDate: new Date().toDateString(),
    songsCompleted: 0,
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
 * Get reward history (list of earning events)
 */
export function getRewardHistory() {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(REWARD_HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

/**
 * Add a reward event to history
 */
export function addRewardToHistory(event) {
  if (typeof window === 'undefined') return
  
  try {
    const history = getRewardHistory()
    history.unshift({
      ...event,
      timestamp: Date.now(),
    })
    // Keep only last 100 events
    const trimmed = history.slice(0, 100)
    localStorage.setItem(REWARD_HISTORY_KEY, JSON.stringify(trimmed))
  } catch (e) {
    console.warn('Failed to save reward history:', e)
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
 * Start a listening session for a track
 */
export function startListeningSession(trackId, trackDuration) {
  if (typeof window === 'undefined') return
  
  const session = {
    trackId,
    trackDuration,
    startTime: Date.now(),
    lastUpdateTime: Date.now(),
    accumulatedSeconds: 0,
    listenedSeconds: 0, // Actual seconds of this track listened
    isActive: true,
    songCompletionRewarded: false,
  }
  
  try {
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
  } catch (e) {
    console.warn('Failed to start session:', e)
  }
  
  return session
}

/**
 * Check if conditions are valid for earning rewards
 * @param {boolean} isPlaying - Is music currently playing
 * @param {number} volume - Current volume (0-1)
 * @param {boolean} isTabActive - Is the browser tab active/focused
 * @returns {object} { valid: boolean, reason: string }
 */
export function checkRewardConditions(isPlaying, volume, isTabActive) {
  if (!isPlaying) {
    return { valid: false, reason: 'paused' }
  }
  if (volume < REWARD_CONFIG.minVolumeForReward) {
    return { valid: false, reason: 'muted' }
  }
  if (!isTabActive) {
    return { valid: false, reason: 'tab_inactive' }
  }
  return { valid: true, reason: null }
}

/**
 * Update listening session and calculate rewards
 * @param {boolean} isPlaying - Is music currently playing
 * @param {number} volume - Current volume (0-1)
 * @param {boolean} isTabActive - Is the browser tab active
 * @param {number} trackProgress - Current track progress (0-100)
 * @returns {object} Updated state with new tokens if any
 */
export function updateListeningSession(isPlaying, volume, isTabActive, trackProgress = 0) {
  if (typeof window === 'undefined') return { tokensEarned: 0, reason: null }
  
  const session = getListeningSession()
  if (!session || !session.isActive) return { tokensEarned: 0, reason: 'no_session' }
  
  // Check anti-abuse conditions
  const conditions = checkRewardConditions(isPlaying, volume, isTabActive)
  if (!conditions.valid) {
    // Update last time but don't accumulate
    session.lastUpdateTime = Date.now()
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
    return { tokensEarned: 0, reason: conditions.reason }
  }
  
  const now = Date.now()
  const elapsedSeconds = Math.floor((now - session.lastUpdateTime) / 1000)
  
  // Only update if at least 1 second passed (avoid rapid calls)
  if (elapsedSeconds < 1) return { tokensEarned: 0, reason: 'too_fast' }
  
  // Cap elapsed to prevent abuse from long gaps
  const cappedElapsed = Math.min(elapsedSeconds, 5)
  
  // Update session
  session.accumulatedSeconds += cappedElapsed
  session.listenedSeconds += cappedElapsed
  session.lastUpdateTime = now
  
  // Get current state
  const state = getRewardsState()
  
  // Check daily cap
  if (state.todayTokensEarned >= REWARD_CONFIG.dailyCap) {
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
    return { 
      tokensEarned: 0, 
      reason: 'daily_cap', 
      totalTokens: state.totalTokens,
      todayTokens: state.todayTokensEarned,
      dailyCap: REWARD_CONFIG.dailyCap,
    }
  }
  
  let tokensEarned = 0
  let events = []
  
  // Calculate minute-based rewards
  const totalMinutes = Math.floor(session.accumulatedSeconds / 60)
  const previousMinutes = Math.floor((session.accumulatedSeconds - cappedElapsed) / 60)
  const newMinutes = totalMinutes - previousMinutes
  
  if (newMinutes > 0) {
    const minuteTokens = newMinutes * REWARD_CONFIG.tokensPerMinute
    tokensEarned += minuteTokens
    state.totalMinutesListened += newMinutes
    state.todayMinutesListened += newMinutes
    state.lifetimeMinutes += newMinutes
    
    events.push({
      type: 'minute',
      tokens: minuteTokens,
      minutes: newMinutes,
    })
  }
  
  // Check song completion bonus (≥80% listened)
  const progressPercent = trackProgress / 100
  if (
    !session.songCompletionRewarded && 
    progressPercent >= REWARD_CONFIG.songCompletionThreshold
  ) {
    tokensEarned += REWARD_CONFIG.songCompletionBonus
    session.songCompletionRewarded = true
    state.songsCompleted = (state.songsCompleted || 0) + 1
    
    events.push({
      type: 'song_complete',
      tokens: REWARD_CONFIG.songCompletionBonus,
      trackId: session.trackId,
    })
  }
  
  // Apply daily cap
  const remainingCap = REWARD_CONFIG.dailyCap - state.todayTokensEarned
  const cappedTokens = Math.min(tokensEarned, remainingCap)
  
  // Update totals
  if (cappedTokens > 0) {
    state.totalTokens += cappedTokens
    state.todayTokensEarned += cappedTokens
    saveRewardsState(state)
    
    // Add to history
    events.forEach(event => {
      addRewardToHistory({
        ...event,
        tokens: event.type === 'minute' ? Math.min(event.tokens, remainingCap) : event.tokens,
      })
    })
  }
  
  // Save session
  try {
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
  } catch (e) {
    console.warn('Failed to update session:', e)
  }
  
  return {
    tokensEarned: cappedTokens,
    totalTokens: state.totalTokens,
    todayMinutes: state.todayMinutesListened,
    todayTokens: state.todayTokensEarned,
    dailyCap: REWARD_CONFIG.dailyCap,
    lifetimeMinutes: state.lifetimeMinutes,
    songsCompleted: state.songsCompleted,
    events,
    hitCap: state.todayTokensEarned >= REWARD_CONFIG.dailyCap,
  }
}

/**
 * End listening session (when track changes or stops)
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
 * Format token amount for display
 */
export function formatTokens(amount) {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
  return amount.toString()
}

/**
 * Get daily progress towards cap
 */
export function getDailyProgress() {
  const state = getRewardsState()
  return {
    earned: state.todayTokensEarned,
    cap: REWARD_CONFIG.dailyCap,
    progress: Math.min((state.todayTokensEarned / REWARD_CONFIG.dailyCap) * 100, 100),
    remaining: Math.max(REWARD_CONFIG.dailyCap - state.todayTokensEarned, 0),
  }
}
