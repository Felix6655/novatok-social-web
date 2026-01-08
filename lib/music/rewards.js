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
        state.todaySongsCompleted = 0
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
    todaySongsCompleted: 0,
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
  if (typeof window === 'undefined') return null
  
  const session = {
    trackId,
    trackDuration,
    startTime: Date.now(),
    lastUpdateTime: Date.now(),
    accumulatedSeconds: 0, // Total seconds accumulated across all tracks
    trackListenedSeconds: 0, // Seconds listened to current track
    isActive: true,
    songCompletionRewarded: false,
    lastMinuteRewarded: 0, // Track which minute we last rewarded
  }
  
  // Preserve accumulated seconds from previous session
  const existingSession = getListeningSession()
  if (existingSession) {
    session.accumulatedSeconds = existingSession.accumulatedSeconds || 0
    session.lastMinuteRewarded = existingSession.lastMinuteRewarded || 0
  }
  
  try {
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
    console.log('[Rewards] Started session:', session)
  } catch (e) {
    console.warn('Failed to start session:', e)
  }
  
  return session
}

/**
 * Check if conditions are valid for earning rewards
 */
export function checkRewardConditions(isPlaying, volume, isTabVisible) {
  if (!isPlaying) {
    return { valid: false, reason: 'paused' }
  }
  if (volume < REWARD_CONFIG.minVolumeForReward) {
    return { valid: false, reason: 'muted' }
  }
  if (!isTabVisible) {
    return { valid: false, reason: 'tab_hidden' }
  }
  return { valid: true, reason: null }
}

/**
 * Update listening session and calculate rewards
 * Call this every second while music is playing
 */
export function updateListeningSession(isPlaying, volume, isTabVisible, trackProgress = 0) {
  if (typeof window === 'undefined') return { tokensEarned: 0, reason: 'ssr' }
  
  const session = getListeningSession()
  if (!session || !session.isActive) {
    console.log('[Rewards] No active session')
    return { tokensEarned: 0, reason: 'no_session' }
  }
  
  const now = Date.now()
  const elapsedMs = now - session.lastUpdateTime
  
  // Prevent rapid calls (must be at least 500ms apart)
  if (elapsedMs < 500) {
    return { tokensEarned: 0, reason: 'too_fast' }
  }
  
  // Check anti-abuse conditions
  const conditions = checkRewardConditions(isPlaying, volume, isTabVisible)
  
  // Always update timestamp
  session.lastUpdateTime = now
  
  if (!conditions.valid) {
    // Save session but don't accumulate time
    console.log('[Rewards] Conditions not met:', conditions.reason)
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
    return { tokensEarned: 0, reason: conditions.reason, session }
  }
  
  // Calculate elapsed seconds (cap at 5 to prevent abuse from long gaps)
  const elapsedSeconds = Math.min(Math.floor(elapsedMs / 1000), 5)
  
  if (elapsedSeconds < 1) {
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
    return { tokensEarned: 0, reason: 'sub_second', session }
  }
  
  // Accumulate time
  session.accumulatedSeconds += elapsedSeconds
  session.trackListenedSeconds += elapsedSeconds
  
  console.log(`[Rewards] Tick: +${elapsedSeconds}s, total: ${session.accumulatedSeconds}s, progress: ${trackProgress.toFixed(1)}%`)
  
  // Get current state and check daily cap
  const state = getRewardsState()
  
  if (state.todayTokensEarned >= REWARD_CONFIG.dailyCap) {
    localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
    return { 
      tokensEarned: 0, 
      reason: 'daily_cap_reached', 
      session,
      state,
    }
  }
  
  let tokensEarned = 0
  let events = []
  
  // Calculate minute-based rewards
  // Award token for each full minute that hasn't been rewarded yet
  const currentMinute = Math.floor(session.accumulatedSeconds / 60)
  const newMinutes = currentMinute - session.lastMinuteRewarded
  
  if (newMinutes > 0) {
    const minuteTokens = newMinutes * REWARD_CONFIG.tokensPerMinute
    tokensEarned += minuteTokens
    session.lastMinuteRewarded = currentMinute
    state.totalMinutesListened += newMinutes
    state.todayMinutesListened += newMinutes
    state.lifetimeMinutes += newMinutes
    
    events.push({
      type: 'minute',
      tokens: minuteTokens,
      minutes: newMinutes,
    })
    
    console.log(`[Rewards] Minute reward: +${minuteTokens} tokens (minute ${currentMinute})`)
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
    state.todaySongsCompleted = (state.todaySongsCompleted || 0) + 1
    
    events.push({
      type: 'song_complete',
      tokens: REWARD_CONFIG.songCompletionBonus,
      trackId: session.trackId,
    })
    
    console.log(`[Rewards] Song completion bonus: +${REWARD_CONFIG.songCompletionBonus} tokens`)
  }
  
  // Apply daily cap to tokens earned this call
  const remainingCap = REWARD_CONFIG.dailyCap - state.todayTokensEarned
  const cappedTokens = Math.min(tokensEarned, remainingCap)
  
  // Update state if tokens earned
  if (cappedTokens > 0) {
    state.totalTokens += cappedTokens
    state.todayTokensEarned += cappedTokens
    saveRewardsState(state)
    
    // Add to history
    events.forEach(event => {
      addRewardToHistory(event)
    })
  }
  
  // Save session
  localStorage.setItem(LISTENING_SESSION_KEY, JSON.stringify(session))
  
  return {
    tokensEarned: cappedTokens,
    totalTokens: state.totalTokens,
    todayMinutes: state.todayMinutesListened,
    todayTokens: state.todayTokensEarned,
    todaySongs: state.todaySongsCompleted || 0,
    dailyCap: REWARD_CONFIG.dailyCap,
    dailyCapRemaining: remainingCap - cappedTokens,
    lifetimeMinutes: state.lifetimeMinutes,
    songsCompleted: state.songsCompleted,
    events,
    hitCap: state.todayTokensEarned >= REWARD_CONFIG.dailyCap,
    session,
    state,
  }
}

/**
 * End listening session (when stopping playback)
 */
export function endListeningSession() {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.removeItem(LISTENING_SESSION_KEY)
    console.log('[Rewards] Session ended')
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
    minutes: state.todayMinutesListened,
    songs: state.todaySongsCompleted || 0,
  }
}

/**
 * Get debug info for the debug panel
 */
export function getDebugInfo() {
  const session = getListeningSession()
  const state = getRewardsState()
  const daily = getDailyProgress()
  
  return {
    session,
    state,
    daily,
    config: REWARD_CONFIG,
  }
}
